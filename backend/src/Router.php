<?php
declare(strict_types=1);

namespace App;

final class Router
{
    /** @var array<int,array{0:string,1:string,2:array,3:array}> */
    private array $routes = [];

    /** $roles: [] = public, ['*'] = any logged-in user, or a list of allowed roles. */
    public function add(string $method, string $pattern, array $handler, array $roles = []): void
    {
        $regex = '#^' . preg_replace('#\{[a-z_]+\}#', '([0-9]+)', $pattern) . '$#';
        preg_match_all('#\{([a-z_]+)\}#', $pattern, $names);
        $this->routes[] = [$method, $regex, $handler, ['roles' => $roles, 'names' => $names[1]]];
    }

    public function dispatch(Request $req): void
    {
        $pathMatched = false;

        foreach ($this->routes as [$method, $regex, $handler, $meta]) {
            if (!preg_match($regex, $req->path, $m)) {
                continue;
            }
            $pathMatched = true;
            if ($method !== $req->method) {
                continue;
            }

            array_shift($m);
            foreach ($meta['names'] as $i => $name) {
                $req->params[$name] = (int) $m[$i];
            }

            $roles = $meta['roles'];
            if ($roles) {
                $user = Auth::userFromToken($req->bearerToken());
                if (!$user) {
                    throw new HttpException(401, 'Unauthenticated.');
                }
                if ($roles !== ['*'] && !in_array($user['role'], $roles, true)) {
                    Audit::log($user['id'], 'access_denied', $req->method . ' ' . $req->path);
                    throw new HttpException(403, 'You do not have permission to perform this action.');
                }
                $req->user = $user;
            }

            [$class, $action] = $handler;
            (new $class())->$action($req);
            return;
        }

        throw $pathMatched
            ? new HttpException(405, 'Method not allowed.')
            : new HttpException(404, 'Not found.');
    }
}
