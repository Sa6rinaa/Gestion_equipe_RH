"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BarChart3, Plus, Users, Clock, CheckCircle } from "lucide-react"

interface Survey {
  id: string
  title: string
  description: string
  questions: Question[]
  status: "draft" | "active" | "closed"
  createdAt: string
  responses: number
  targetResponses: number
}

interface Question {
  id: string
  type: "text" | "radio" | "checkbox" | "scale"
  question: string
  options?: string[]
  required: boolean
}

interface SurveyResponse {
  surveyId: string
  responses: Record<string, any>
  submittedAt: string
}

interface SurveyManagerProps {
  userRole: "employee" | "admin"
}

export default function SurveyManager({ userRole }: SurveyManagerProps) {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
    title: "",
    description: "",
    questions: [],
    targetResponses: 25,
  })

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = () => {
    const saved = localStorage.getItem("surveys")
    if (saved) {
      setSurveys(JSON.parse(saved))
    } else {
      // Initialize with sample surveys
      const sampleSurveys: Survey[] = [
        {
          id: "1",
          title: "Satisfaction au Travail Q1 2024",
          description: "Évaluez votre satisfaction générale au travail",
          questions: [
            {
              id: "1",
              type: "scale",
              question: "Comment évaluez-vous votre satisfaction générale au travail ?",
              required: true,
            },
            {
              id: "2",
              type: "radio",
              question: "Recommanderiez-vous notre entreprise comme lieu de travail ?",
              options: ["Certainement", "Probablement", "Peut-être", "Probablement pas", "Certainement pas"],
              required: true,
            },
            {
              id: "3",
              type: "text",
              question: "Quelles améliorations suggéreriez-vous ?",
              required: false,
            },
          ],
          status: "active",
          createdAt: new Date().toISOString(),
          responses: 12,
          targetResponses: 25,
        },
      ]
      setSurveys(sampleSurveys)
      localStorage.setItem("surveys", JSON.stringify(sampleSurveys))
    }
  }

  const saveSurveys = (updatedSurveys: Survey[]) => {
    setSurveys(updatedSurveys)
    localStorage.setItem("surveys", JSON.stringify(updatedSurveys))
  }

  const createSurvey = () => {
    if (!newSurvey.title || !newSurvey.description) return

    const survey: Survey = {
      id: Date.now().toString(),
      title: newSurvey.title,
      description: newSurvey.description,
      questions: newSurvey.questions || [],
      status: "draft",
      createdAt: new Date().toISOString(),
      responses: 0,
      targetResponses: newSurvey.targetResponses || 25,
    }

    const updatedSurveys = [survey, ...surveys]
    saveSurveys(updatedSurveys)
    setNewSurvey({ title: "", description: "", questions: [], targetResponses: 25 })
    setIsCreating(false)
  }

  const submitSurveyResponse = (survey: Survey) => {
    const response: SurveyResponse = {
      surveyId: survey.id,
      responses,
      submittedAt: new Date().toISOString(),
    }

    // Save response
    const savedResponses = JSON.parse(localStorage.getItem("surveyResponses") || "[]")
    savedResponses.push(response)
    localStorage.setItem("surveyResponses", JSON.stringify(savedResponses))

    // Update survey response count
    const updatedSurveys = surveys.map((s) => (s.id === survey.id ? { ...s, responses: s.responses + 1 } : s))
    saveSurveys(updatedSurveys)

    // Save to completed surveys for stats
    const completedSurveys = JSON.parse(localStorage.getItem("completedSurveys") || "[]")
    completedSurveys.push({ surveyId: survey.id, userId: "current-user", completedAt: new Date().toISOString() })
    localStorage.setItem("completedSurveys", JSON.stringify(completedSurveys))

    setActiveSurvey(null)
    setResponses({})
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "text":
        return (
          <Textarea
            placeholder="Votre réponse..."
            value={responses[question.id] || ""}
            onChange={(e) => setResponses((prev) => ({ ...prev, [question.id]: e.target.value }))}
          />
        )

      case "radio":
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onValueChange={(value) => setResponses((prev) => ({ ...prev, [question.id]: value }))}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "scale":
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Très insatisfait</span>
              <span>Très satisfait</span>
            </div>
            <RadioGroup
              value={responses[question.id] || ""}
              onValueChange={(value) => setResponses((prev) => ({ ...prev, [question.id]: value }))}
              className="flex justify-between"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={value.toString()} id={`${question.id}-${value}`} />
                  <Label htmlFor={`${question.id}-${value}`} className="text-sm">
                    {value}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      default:
        return null
    }
  }

  if (userRole === "employee") {
    const activeSurveys = surveys.filter((s) => s.status === "active")
    const completedSurveyIds = JSON.parse(localStorage.getItem("surveyResponses") || "[]").map(
      (r: SurveyResponse) => r.surveyId,
    )

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Sondages Internes
            </CardTitle>
            <CardDescription>Participez aux sondages pour améliorer votre environnement de travail</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSurvey ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{activeSurvey.title}</h3>
                  <p className="text-gray-600">{activeSurvey.description}</p>
                </div>

                <div className="space-y-6">
                  {activeSurvey.questions.map((question, index) => (
                    <div key={question.id} className="space-y-3">
                      <Label className="text-base font-medium">
                        {index + 1}. {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => submitSurveyResponse(activeSurvey)}>Soumettre les réponses</Button>
                  <Button variant="outline" onClick={() => setActiveSurvey(null)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSurveys.length > 0 ? (
                  activeSurveys.map((survey) => (
                    <div key={survey.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{survey.title}</h3>
                        <div className="flex items-center gap-2">
                          {completedSurveyIds.includes(survey.id) ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complété
                            </Badge>
                          ) : (
                            <Badge variant="default">Nouveau</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{survey.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {survey.responses}/{survey.targetResponses} réponses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {survey.questions.length} questions
                          </span>
                        </div>
                        {!completedSurveyIds.includes(survey.id) && (
                          <Button size="sm" onClick={() => setActiveSurvey(survey)}>
                            Participer
                          </Button>
                        )}
                      </div>
                      <Progress value={(survey.responses / survey.targetResponses) * 100} className="mt-3 h-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucun sondage actif pour le moment</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin view
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Gestion des Sondages
              </CardTitle>
              <CardDescription>Créez et gérez les sondages internes de l'entreprise</CardDescription>
            </div>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Sondage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isCreating ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du sondage</Label>
                <Input
                  id="title"
                  value={newSurvey.title || ""}
                  onChange={(e) => setNewSurvey((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Satisfaction au travail Q1 2024"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSurvey.description || ""}
                  onChange={(e) => setNewSurvey((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez l'objectif de ce sondage..."
                />
              </div>
              <div>
                <Label htmlFor="target">Nombre de réponses cibles</Label>
                <Input
                  id="target"
                  type="number"
                  value={newSurvey.targetResponses || 25}
                  onChange={(e) =>
                    setNewSurvey((prev) => ({ ...prev, targetResponses: Number.parseInt(e.target.value) }))
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={createSurvey}>Créer le sondage</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div key={survey.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{survey.title}</h3>
                    <Badge
                      variant={
                        survey.status === "active" ? "default" : survey.status === "draft" ? "secondary" : "outline"
                      }
                    >
                      {survey.status === "active" ? "Actif" : survey.status === "draft" ? "Brouillon" : "Fermé"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{survey.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {survey.responses}/{survey.targetResponses} réponses
                      </span>
                      <span>{survey.questions.length} questions</span>
                      <span>{new Date(survey.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <Progress value={(survey.responses / survey.targetResponses) * 100} className="mt-3 h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
