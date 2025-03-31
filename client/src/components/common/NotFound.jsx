import { Link } from "react-router-dom"

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8">
      <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mb-4">Page Not Found</h2>
      <p className="text-text-secondary text-center mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
      >
        Go to Home
      </Link>
    </div>
  )
}

export default NotFound

