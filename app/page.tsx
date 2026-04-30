import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-gray-900">
      
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-blue-700">
          Master Your World. <br />
          <span className="text-gray-900">One Subject at a Time.</span>
        </h1>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From high school basics to advanced college research. Get verified notes, take practice exams, and find expert tutors in Math, Biology, Chemistry, and Computer Science.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href="/learn" 
            className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Start Learning Free
          </Link>
          <Link 
            href="/tutors" 
            className="px-8 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition"
          >
            Find a Tutor
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl">
        <FeatureCard 
          title="Verified Notes" 
          description="Access high-quality study materials reviewed by academic experts."
          icon="📚"
        />
        <FeatureCard 
          title="Practice Quizzes" 
          description="Test your knowledge with gamified, local past-paper questions."
          icon="✍️"
        />
        <FeatureCard 
          title="Expert Tutors" 
          description="Connect with top university researchers and teachers in your area."
          icon="👨‍🏫"
        />
      </div>

    </main>
  );
}

// A simple reusable component for the features
function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-left">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}