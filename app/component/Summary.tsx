import StoreGuage from './StoreGuage'
import ScoreBadge from './ScoreBadge';


const Category = ({title, score}: {title: string, score: number}) => {
    const textColor = score > 70 ? 'text-green-600' 
        : score > 49 ? "text-yellow-600" : "text-red-600";
    return(
        <div className='resume-summary'>
            <div className='category'>
                <div className='flex flex-row gap-2 items-center justify-content'>
                    <p>{title}</p>
                    <ScoreBadge score={score}/>
                </div>
                <p className='text-2xl'> 
                    {/* <ScoreBadge score={score}/> */}
                    <span className={textColor}>
                        {/* <ScoreBadge score={score}/> */}
                        {score}</span>/100
                </p>
            </div>
        </div>
    )
}
function Summary({feedback}: {feedback: Feedback}) {
  return (
    // <div>Summary</div>
    <div className='bg-white rounded-2xl shadow-md w-full'>
        <div className='flex flex-row items-center p-4 gap-8'>
            <StoreGuage score={feedback.overallScore}/>
            <div className='flex flex-col gap-2'>
                <h2 className='text-2xl font-bold'>Your Resume Score</h2>
                <p className='text-sm text-gray-500'>This score is calculated based on the variables listed below.</p>
            </div>
        </div>
        <Category title="Tone & Style" score={feedback.toneAndStyle.score}/>
        <Category title="Content" score={feedback.content.score}/>
        <Category title="Structure" score={feedback.structure.score}/>
        <Category title="Tone & Style" score={feedback.skills.score}/>
    </div>

  )
}

export default Summary