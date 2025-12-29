import Navbar from "~/component/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "constants/index";
import Resume from "~/component/Resume";
import { usePuterStore } from "~/lib/putter";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Analyse your resume for your dream job!" },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if(!auth.isAuthenticated){
      navigate('/auth?next=/')
    }
  }, [auth.isAuthenticated])

  
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    {/* {window.puter.auth.} */}
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume Ratings</h1>
        <h2>Review your submissions with AI-powered feedback.</h2>
      </div>
      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <Resume key={resume.id} resume={resume}></Resume>
          ))}
        </div>
      )}
    </section>
    
  </main>
}
