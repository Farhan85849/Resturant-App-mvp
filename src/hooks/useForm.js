// src/hooks/useForm.js
// Generic form hook: manages values, errors, validation, submit, reset
import { useState, useCallback } from 'react';

/**
 * @param {Object} initialValues  - Initial field values
 * @param {Function} validate     - (values) => errorsObject
 */
export default function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as soon as the user edits it
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (onSubmit) => {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return { values, errors, handleChange, handleSubmit, reset, isValid, isSubmitting };
}
