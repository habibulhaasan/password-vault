const fs = require('fs');
const path = 'components/credentials/credential-form.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('import { useForm, useWatch } from "react-hook-form";', 'import { useForm, useWatch, useFieldArray } from "react-hook-form";');

const hookSetup = `  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CredentialFormValues>({`;

const fieldArraySetup = `  const { fields: sqFields, append: appendSq, remove: removeSq } = useFieldArray({
    control,
    name: "securityQuestions"
  });`;

content = content.replace(hookSetup, hookSetup); // Do nothing just verifying we can find it
const insertPoint = `    },
  });`;

content = content.replace(insertPoint, insertPoint + '\n\n' + fieldArraySetup);

const defaultReplace = `      securityQuestion: initialValues?.securityQuestion || "",
      answer: initialValues?.answer || "",`;
const defaultNew = `      securityQuestions: initialValues?.securityQuestions || [],`;
content = content.replace(defaultReplace, defaultNew);

const oldUI = `                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="securityQuestion">Security Question</Label>
                    <Input
                      id="securityQuestion"
                      type="text"
                      placeholder="e.g. Mother's maiden name"
                      disabled={isSubmitting}
                      {...register("securityQuestion")}
                    />
                    {errors.securityQuestion && (
                      <p className="text-xs text-destructive">{errors.securityQuestion.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="answer">Answer</Label>
                    <Input
                      id="answer"
                      type="text"
                      placeholder="Answer"
                      disabled={isSubmitting}
                      {...register("answer")}
                    />
                    {errors.answer && (
                      <p className="text-xs text-destructive">{errors.answer.message}</p>
                    )}
                  </div>
                </div>`;

const newUI = `                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Security Questions</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs" 
                      onClick={() => appendSq({ question: "", answer: "" })}
                    >
                      <Plus className="size-3 mr-1" /> Add Question
                    </Button>
                  </div>
                  
                  {sqFields.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No security questions added.</p>
                  )}
                  
                  <div className="space-y-4">
                    {sqFields.map((field, index) => (
                      <div key={field.id} className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 p-3 border rounded-md bg-muted/20">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-1 top-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeSq(index)}
                        >
                          <X className="size-3.5" />
                        </Button>
                        <div className="space-y-1.5 pr-6 sm:pr-0">
                          <Label className="text-xs">Question</Label>
                          <Input
                            placeholder="e.g. Mother's maiden name"
                            disabled={isSubmitting}
                            {...register(\`securityQuestions.\${index}.question\` as const)}
                          />
                          {errors.securityQuestions?.[index]?.question && (
                            <p className="text-xs text-destructive">{errors.securityQuestions[index]?.question?.message}</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">Answer</Label>
                          <Input
                            placeholder="Answer"
                            disabled={isSubmitting}
                            {...register(\`securityQuestions.\${index}.answer\` as const)}
                          />
                          {errors.securityQuestions?.[index]?.answer && (
                            <p className="text-xs text-destructive">{errors.securityQuestions[index]?.answer?.message}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>`;

content = content.replace(oldUI, newUI);

const oldMap = `        securityQuestion: values.securityQuestion || undefined,
        answer: values.answer || undefined,`;
const newMap = `        securityQuestions: values.securityQuestions?.length ? values.securityQuestions : undefined,`;
content = content.replace(oldMap, newMap);

fs.writeFileSync(path, content, 'utf8');
console.log('UI Form updated');
