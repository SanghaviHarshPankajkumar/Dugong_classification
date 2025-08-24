const DashboardHeader = () => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 w-full gap-4 md:gap-0">
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-black">
            Dashboard
          </h3>
          <p className="text-sm text-gray-500">
            Quick insights and results, all in one view
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
