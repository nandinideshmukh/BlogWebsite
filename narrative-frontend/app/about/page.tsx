"use client";

import Navbar from "../components/NavBar"
import Link from "next/link";
import { 
  Github, 
  Linkedin, 
  Mail, 
  Twitter, 
  Globe, 
  Code2, 
  Server, 
  Smartphone,
  ArrowRight,
  Sparkles,
  Heart
} from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Nandini Deshmukh",
      role: "Backend Developer",
      expertise: "FastAPI • Python • Database Architecture",
      bio: "Passionate about building scalable and efficient backend systems. Loves working with FastAPI and modern database technologies.",
      email: "nandini.deshmukh@blogapp.com",
      github: "https://github.com/nandinideshmukh",
      linkedin: "https://linkedin.com/in/nandinideshmukh",
      twitter: "https://twitter.com/nandinideshmukh",
      icon: Server,
      color: "from-blue-600 to-cyan-600"
    },
    {
      name: "Siddhi Chavan",
      role: "Frontend Developer",
      expertise: "React • Next.js • Tailwind CSS",
      bio: "Creative frontend developer with an eye for beautiful designs. Specializes in creating responsive and interactive user interfaces.",
      email: "siddhi.chavan@blogapp.com",
      github: "https://github.com/siddhichavan",
      linkedin: "https://linkedin.com/in/siddhichavan",
      twitter: "https://twitter.com/siddhichavan",
      icon: Smartphone,
      color: "from-purple-600 to-pink-600"
    }
  ];

  return (
    <>
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 mb-8 shadow-sm">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Meet The Team
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Behind the Blog
                </span>
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                We're a passionate team of developers dedicated to creating the best blogging platform 
                for writers and readers around the world.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Our Core Team
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The talented people bringing BlogWebsite to life
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {teamMembers.map((member, index) => {
                const Icon = member.icon;
                
                return (
                  <div
                    key={index}
                    className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${member.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative p-8">
                      {/* Icon and Name Section */}
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-r ${member.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        {/* Social Links */}
                        <div className="flex space-x-2">
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300 group/link"
                            aria-label="GitHub"
                          >
                            <Github className="w-5 h-5 text-gray-600 group-hover/link:scale-110 transition-transform" />
                          </a>
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300 group/link"
                            aria-label="LinkedIn"
                          >
                            <Linkedin className="w-5 h-5 text-gray-600 group-hover/link:scale-110 transition-transform" />
                          </a>
                          <a
                            href={member.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300 group/link"
                            aria-label="Twitter"
                          >
                            <Twitter className="w-5 h-5 text-gray-600 group-hover/link:scale-110 transition-transform" />
                          </a>
                        </div>
                      </div>

                      {/* Member Info */}
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          {member.name}
                        </h3>
                        <p className={`text-lg font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent mb-2`}>
                          {member.role}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          {member.expertise}
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {member.bio}
                        </p>
                      </div>

                      {/* Email Contact */}
                      <div className="pt-4 border-t border-gray-100">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group/email"
                        >
                          <Mail className="w-4 h-4 group-hover/email:scale-110 transition-transform" />
                          <span className="text-sm">{member.email}</span>
                        </a>
                      </div>

                      {/* Decorative Elements */}
                      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${member.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Built With Modern Tech
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The technologies powering our platform
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {/* Backend Stack */}
              <div className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Server className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">FastAPI</h3>
                <p className="text-sm text-gray-500">Backend</p>
              </div>

              {/* Frontend Stack */}
              <div className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Next.js</h3>
                <p className="text-sm text-gray-500">Frontend</p>
              </div>

              {/* Styling */}
              <div className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">Tailwind CSS</h3>
                <p className="text-sm text-gray-500">Styling</p>
              </div>

              {/* Database */}
              <div className="group p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">SQLite</h3>
                <p className="text-sm text-gray-500">Database</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Want to Work With Us?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented developers to join our team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="mailto:careers@blogapp.com"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300"
              >
                <Heart className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}