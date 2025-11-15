import { ButtonHTMLAttributes, ReactNode } from 'react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  icon?: ReactNode;
}

export function LoadingButton({
  loading = false,
  children,
  variant = 'primary',
  icon,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const baseClasses = 'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg',
    success: 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Зареждане...</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
