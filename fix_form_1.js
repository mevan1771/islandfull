const fs = require('fs');
const path = require('path');

const formPath = path.join(__dirname, 'components', 'admin', 'TourForm.tsx');
let formContent = fs.readFileSync(formPath, 'utf8');

// 1. Change TOTAL_STEPS
formContent = formContent.replace(
    /const TOTAL_STEPS = 4;/,
    `const TOTAL_STEPS = 5;`
);

// 2. Add faqs state
const optionsStateRegex = /const updateOption = \(index: number, field: 'title' \| 'price_modifier', value: string\) => \{\n    const newOptions = \[\.\.\.options\]\n    newOptions\[index\]\[field\] = value\n    setOptions\(newOptions\)\n  \}/;
const faqsState = `
  // FAQs State (array of {question, answer})
  const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>(() => {
    if (initialData?.faqs && Array.isArray(initialData.faqs)) {
      return initialData.faqs.map((faq: any) => ({
        question: faq.question || "",
        answer: faq.answer || ""
      }))
    }
    return []
  })

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }])
  const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index))
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs]
    newFaqs[index][field] = value
    setFaqs(newFaqs)
  }`;

formContent = formContent.replace(optionsStateRegex, match => match + faqsState);

// 3. Add Step 4 UI and change old Step 4 to Step 5
const step4Regex = /\{\/\* STEP 4: MEDIA \*\/\}\n          <div id="step-4" className=\{step === 4 \? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"\}>/;

const newStep4 = `{/* STEP 4: FAQS */}
          <div id="step-4" className={step === 4 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-zinc-900">Frequently Asked Questions</h2>
              <p className="text-zinc-500 text-sm mt-1">Anticipate customer questions and provide clear answers.</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-800 tracking-wide uppercase flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-rose-500" />
                    Q&A Pairs
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">These will appear as an accordion on the public tour page.</p>
                </div>
                <button type="button" onClick={addFaq} className="text-sm font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-full transition-colors">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              {/* Hidden input for JSON */}
              <input
                type="hidden"
                name="faqs"
                value={JSON.stringify(
                  faqs.filter(f => f.question.trim() !== "" && f.answer.trim() !== "").map(f => ({
                    question: f.question,
                    answer: f.answer
                  }))
                )}
              />

              {faqs.length > 0 ? (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={\`faq-\${idx}\`} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <button type="button" onClick={() => removeFaq(idx)} className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <div className="space-y-4 pr-12">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                            placeholder="e.g. What should I bring?"
                            className="w-full h-12 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Answer</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                            placeholder="e.g. Please bring sunscreen, a towel, and a reusable water bottle."
                            rows={3}
                            className="w-full p-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none font-medium resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                  <p className="text-sm font-medium text-zinc-500">No FAQs added. The FAQ section will not be displayed.</p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 5: MEDIA */}
          <div id="step-5" className={step === 5 ? "block animate-in fade-in slide-in-from-right-4 duration-500" : "hidden"}>`;

formContent = formContent.replace(step4Regex, newStep4);

fs.writeFileSync(formPath, formContent, 'utf8');
console.log('Successfully updated TourForm.tsx');
