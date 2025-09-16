import './tailwind.css';

export default function Loading() {
  return (
    <div className="
        fixed inset-0            
        flex justify-center items-center
        bg-black bg-opacity-50  
        z-50                   
      "
      role="status"
    >
      <div className="flex items-center space-x-4">
        <div
          className="
            h-16 w-16 animate-spin rounded-full 
            border-4 border-solid border-current border-r-transparent
            motion-reduce:animate-[spin_1.5s_linear_infinite]
          "
        />
        <span className="text-white text-xl font-semibold">
          Fetching a problem for you!!
        </span>
      </div>
    </div>
  );
}
