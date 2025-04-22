const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0  z-50 flex flex-col items-center justify-center">
      <div className="relative flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-lg font-medium text-gray-800">
          Please wait
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
  