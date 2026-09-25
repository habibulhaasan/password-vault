const fs = require('fs');
const path = 'components/credentials/credential-form.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update defaultValues
const oldDefaults = `      tags: initialValues?.tags || [],
      notes: initialValues?.notes || "",
    },`;
const newDefaults = `      tags: initialValues?.tags || [],
      notes: initialValues?.notes || "",
      recoveryEmail: initialValues?.recoveryEmail || "",
      mobile: initialValues?.mobile || "",
      securityQuestion: initialValues?.securityQuestion || "",
      answer: initialValues?.answer || "",
    },`;
content = content.replace(oldDefaults, newDefaults);

// Add new fields UI to advanced section (after Logo URL)
const oldUI = `                </div>
              </div>
            </div>`;
const newUI = `                </div>
                
                {/* Security/Recovery Fields */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <h4 className="text-sm font-medium text-foreground">Recovery & Security</h4>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="recoveryEmail">Recovery Email</Label>
                      <Input
                        id="recoveryEmail"
                        type="email"
                        placeholder="recovery@example.com"
                        {...register("recoveryEmail")}
                      />
                      {errors.recoveryEmail && (
                        <p className="text-xs text-destructive">{errors.recoveryEmail.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        {...register("mobile")}
                      />
                      {errors.mobile && (
                        <p className="text-xs text-destructive">{errors.mobile.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="securityQuestion">Security Question</Label>
                      <Input
                        id="securityQuestion"
                        type="text"
                        placeholder="e.g. Mother's maiden name"
                        {...register("securityQuestion")}
                      />
                      {errors.securityQuestion && (
                        <p className="text-xs text-destructive">{errors.securityQuestion.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer">Answer</Label>
                      <Input
                        id="answer"
                        type="text"
                        placeholder="Answer"
                        {...register("answer")}
                      />
                      {errors.answer && (
                        <p className="text-xs text-destructive">{errors.answer.message}</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>`;

// Safely insert it right after the Advanced Fields Container finishes
// Let's find exactly where to insert. The advanced section ends with `</div>`
const insertionPoint = `                  </div>
                </div>

              </div>
            </div>
          </CardContent>`;

content = content.replace(insertionPoint, newUI + '\n          </CardContent>');

fs.writeFileSync(path, content, 'utf8');
console.log('Success');
