import Loader from "./loader";

const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Loader size="xl" />
    </div>
  );
};

export default FullPageLoader;

