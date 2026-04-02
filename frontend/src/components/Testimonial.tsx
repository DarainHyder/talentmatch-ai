import React from 'react';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ name, role, content, avatar }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl mr-4">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{content}"</p>
      <div className="flex mt-4 text-yellow-400">
        {'★★★★★'.split('').map((star, i) => (
          <span key={i}>{star}</span>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
