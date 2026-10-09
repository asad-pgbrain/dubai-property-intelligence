interface Props {
  title?: string;
  message?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We could not load this data. Please try again in a moment.",
}: Props) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-sm text-red-700 max-w-md mx-auto">{message}</p>
    </div>
  );
}
