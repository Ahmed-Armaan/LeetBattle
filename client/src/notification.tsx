function Notification({ message }: { message: string }) {
  return (
    <div className="fixed bottom-4 right-4 bg-gray-700 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
    </div>
  )
}

export default Notification;
