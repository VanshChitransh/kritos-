import Navbar from "~/component/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "constants/index";
import Resume from "~/component/Resume";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Analyse your resume for your dream job!" },
  ];
}

export default function Home() {
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
