import { useEffect, useState, type FormEvent } from "react"
import Navbar from "~/component/Navbar"
import FileUploader from "~/component/FileUploader"
import { usePuterStore } from "~/lib/putter"
import { useNavigate } from "react-router"
import { convertPdfToImage } from "~/lib/pdf2image"
import { generateUUID } from "~/lib/utils"
import { prepareInstructions } from "../../constants"

function upload() {
  const { fs, auth, ai, kv } = usePuterStore();
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if(!auth.isAuthenticated){
        navigate('/auth?next=/upload')
    }
  }, [auth.isAuthenticated])

  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  const extractFeedbackText = (content: unknown) => {
      if (typeof content === "string") {
          return content.trim();
      }
      if (Array.isArray(content)) {
          const textParts = content
              .map((part) => {
                  if (part && typeof part === "object" && "type" in part) {
                      const typedPart = part as { type?: string; text?: string };
                      if (typedPart.type === "text" && typeof typedPart.text === "string") {
                          return typedPart.text;
                      }
                  }
                  return "";
              })
              .filter(Boolean);
          return textParts.join("").trim();
      }
      return "";
  };

  const parseFeedback = (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed) {
          throw new Error("Empty AI response");
      }
      try {
          return JSON.parse(trimmed);
      } catch {
          const match = trimmed.match(/\{[\s\S]*\}/);
          if (!match) {
              throw new Error("AI response was not JSON");
          }
          return JSON.parse(match[0]);
      }
  };

  const handleAnalyze = async({ companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        const stopWithError = (message: string) => {
            setStatusText(message);
            setIsProcessing(false);
        };
        try {
            setIsProcessing(true);
            setStatusText("Uploading the file...");
            // console.log("Uploading file:", file.name);
            const uploadFile = await fs.upload([file]);
            // console.log("Uploaded file info:", uploadFile);
            if(!uploadFile) return stopWithError('Error: Failed to upload file');

            setStatusText('Converting to image...');
            // console.log("Converting file to image:", uploadFile.path);
            const imageFile = await convertPdfToImage(file);
            // console.log("Converted image file info:", imageFile);
            if (!imageFile.file) {
                return stopWithError(
                    `Error: Failed to convert pdf to image${imageFile.error ? ` (${imageFile.error})` : ""}`
                );
            }
            // console.log("Image file ready for upload:", imageFile.file.name);
            setStatusText('Uploading the image...');
            const uploadImage = await fs.upload([imageFile.file]);
            if(!uploadImage) return stopWithError("Error: Failed to uplaod Image");

            setStatusText('Preparing data...');

            const uuid = generateUUID();
            const data = {
                id: uuid, 
                resumePath: uploadFile.path, 
                imagePath: uploadImage.path, 
                companyName, jobTitle, jobDescription, 
                feedback: '',
            }
            await kv.set(`resume ${uuid}`, JSON.stringify(data));
            setStatusText('Analyzing...')

            const feedback = await ai.feedback(
                uploadFile.path,
                uploadImage.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if(!feedback) return stopWithError("Error: Failed to analyse Resume"); 

            const feedbackText = extractFeedbackText(feedback.message.content);
            data.feedback = parseFeedback(feedbackText);
            await kv.set(`resume ${uuid}`, JSON.stringify(data));
            setStatusText("Analysis Complete, redirecting...")
            console.log("Resume ID:", data.id);
            console.log("Feedback:", data.feedback);
            console.log("Data saved to KV store:", data);
            // console.log("KV Key:", `resume ${uuid}`);
            navigate(`/resume/${uuid}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            stopWithError(`Error: ${message}`);
        }
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget.closest('form')
    if(!form) return 
    const formData = new FormData(form)
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string; 
    const jobDescription = formData.get('job-description') as string;
    // console.log({companyName, jobDescription, jobTitle})
    if(!file){
        return
    }
    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  }
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Smart feedback for your dream Job</h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" className="w-full "></img>
                    </>
                ) : (
                    <h2>Drop your resume for an ATS score and improvement tips</h2>
                )}
                {!isProcessing && (
                    <form className="flex flex-col gap-4 mt-8" onSubmit={handleSubmit} id="upload-form">
                        <div className="form-div">
                            <label htmlFor = "company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder="Company Name" id="company-name"></input>
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder="Job Title" id="job-title"></input>
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description"></textarea>
                        </div>
                        <div className="form-div">
                            <label htmlFor="uploaded">Upload Resume</label>
                            <FileUploader file={file} onFileSelect={handleFileSelect}/>
                        </div>
                        <button type="submit" className="primary-button">
                            Analyze Resume
                        </button>
                    </form>
                )}
            </div>
        </section>
    </main>
  )
}

export default upload
