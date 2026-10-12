<?php
declare(strict_types=1);

namespace App;

/** Small input validator. Rules: required|string|int|numeric|min:N|max:N|in:a,b|regex:/../ */
final class Validator
{
    public static function validate(array $data, array $rules): array
    {
        $errors = [];
        $clean = [];

        foreach ($rules as $field => $ruleString) {
            $rulesList = explode('|', $ruleString);
            $value = $data[$field] ?? null;
            if (is_string($value)) {
                $value = trim($value);
            }
            $required = in_array('required', $rulesList, true);
            $label = str_replace('_', ' ', $field);

            if ($value === null || $value === '') {
                if ($required) {
                    $errors[$field][] = "The $label field is required.";
                }
                continue;
            }

            foreach ($rulesList as $rule) {
                if ($rule === 'required') {
                    continue;
                }
                [$name, $arg] = array_pad(explode(':', $rule, 2), 2, null);
                switch ($name) {
                    case 'string':
                        if (!is_string($value)) { $errors[$field][] = "The $label must be text."; }
                        break;
                    case 'int':
                        if (filter_var($value, FILTER_VALIDATE_INT) === false) { $errors[$field][] = "The $label must be a whole number."; }
                        else { $value = (int) $value; }
                        break;
                    case 'numeric':
                        if (!is_numeric($value)) { $errors[$field][] = "The $label must be a number."; }
                        else { $value = (float) $value; }
                        break;
                    case 'min':
                        if (is_string($value) && mb_strlen($value) < (int) $arg) { $errors[$field][] = "The $label must be at least $arg characters."; }
                        elseif (is_numeric($value) && !is_string($value) && $value < (float) $arg) { $errors[$field][] = "The $label must be at least $arg."; }
                        break;
                    case 'max':
                        if (is_string($value) && mb_strlen($value) > (int) $arg) { $errors[$field][] = "The $label may not be greater than $arg characters."; }
                        elseif (is_numeric($value) && !is_string($value) && $value > (float) $arg) { $errors[$field][] = "The $label may not be greater than $arg."; }
                        break;
                    case 'in':
                        if (!in_array((string) $value, explode(',', (string) $arg), true)) { $errors[$field][] = "The selected $label is invalid."; }
                        break;
                    case 'regex':
                        if (!is_string($value) || !preg_match((string) $arg, $value)) { $errors[$field][] = "The $label format is invalid."; }
                        break;
                }
            }
            $clean[$field] = $value;
        }

        if ($errors) {
            $first = array_values($errors)[0][0];
            throw new HttpException(422, $first, $errors);
        }
        return $clean;
    }
}
