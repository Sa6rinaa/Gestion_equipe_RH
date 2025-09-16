"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { BookOpen, Star, Clock, CheckCircle, Users } from "lucide-react"

interface Training {
  id: string
  title: string
  instructor: string
  duration: string
  date: string
  description: string
  status: "upcoming" | "completed" | "in-progress"
}

interface TrainingEvaluation {
  id: string
  trainingId: string
  ratings: {
    content: number
    instructor: number
    materials: number
    overall: number
  }
  feedback: string
  wouldRecommend: boolean
  submittedAt: string
}

const sampleTrainings: Training[] = [
  {
    id: "1",
    title: "Formation Leadership Moderne",
    instructor: "Marie Dubois",
    duration: "2 jours",
    date: "2024-01-15",
    description: "Développez vos compétences en leadership pour manager efficacement vos équipes",
    status: "completed",
  },
  {
    id: "2",
    title: "Gestion du Stress au Travail",
    instructor: "Dr. Pierre Martin",
    duration: "1 jour",
    date: "2024-01-22",
    description: "Techniques et outils pour mieux gérer le stress professionnel",
    status: "completed",
  },
  {
    id: "3",
    title: "Communication Interpersonnelle",
    instructor: "Sophie Laurent",
    duration: "1.5 jours",
    date: "2024-02-05",
    description: "Améliorez vos compétences de communication avec vos collègues",
    status: "upcoming",
  },
]

export default function TrainingEvaluation() {
  const [trainings, setTrainings] = useState<Training[]>(sampleTrainings)
  const [evaluations, setEvaluations] = useState<TrainingEvaluation[]>([])
  const [activeEvaluation, setActiveEvaluation] = useState<Training | null>(null)
  const [ratings, setRatings] = useState({
    content: 0,
    instructor: 0,
    materials: 0,
    overall: 0,
  })
  const [feedback, setFeedback] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)

  useEffect(() => {
    loadEvaluations()
  }, [])

  const loadEvaluations = () => {
    const saved = localStorage.getItem("trainingEvaluations")
    if (saved) {
      setEvaluations(JSON.parse(saved))
    }
  }

  const submitEvaluation = () => {
    if (
      !activeEvaluation ||
      !ratings.content ||
      !ratings.instructor ||
      !ratings.materials ||
      !ratings.overall ||
      wouldRecommend === null
    ) {
      return
    }

    const evaluation: TrainingEvaluation = {
      id: Date.now().toString(),
      trainingId: activeEvaluation.id,
      ratings,
      feedback: feedback.trim(),
      wouldRecommend,
      submittedAt: new Date().toISOString(),
    }

    const updatedEvaluations = [evaluation, ...evaluations]
    setEvaluations(updatedEvaluations)
    localStorage.setItem("trainingEvaluations", JSON.stringify(updatedEvaluations))

    // Save to completed trainings for stats
    const completedTrainings = JSON.parse(localStorage.getItem("completedTrainings") || "[]")
    completedTrainings.push({
      trainingId: activeEvaluation.id,
      userId: "current-user",
      completedAt: new Date().toISOString(),
      rating: ratings.overall,
    })
    localStorage.setItem("completedTrainings", JSON.stringify(completedTrainings))

    // Reset form
    setActiveEvaluation(null)
    setRatings({ content: 0, instructor: 0, materials: 0, overall: 0 })
    setFeedback("")
    setWouldRecommend(null)
  }

  const renderStarRating = (category: keyof typeof ratings, label: string) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRatings((prev) => ({ ...prev, [category]: star }))}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                star <= ratings[category] ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-400 hover:bg-gray-300"
              }`}
            >
              <Star className="w-4 h-4" fill={star <= ratings[category] ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  const getEvaluatedTrainingIds = () => {
    return evaluations.map((evaluation) => evaluation.trainingId)
  }

  const completedTrainings = trainings.filter((t) => t.status === "completed")
  const evaluatedIds = getEvaluatedTrainingIds()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Évaluation de Formation
          </CardTitle>
          <CardDescription>Évaluez les formations suivies pour nous aider à améliorer nos programmes</CardDescription>
        </CardHeader>
        <CardContent>
          {activeEvaluation ? (
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900">{activeEvaluation.title}</h3>
                <p className="text-purple-700 text-sm mt-1">
                  Formateur: {activeEvaluation.instructor} • {activeEvaluation.duration}
                </p>
                <p className="text-purple-600 text-sm mt-2">{activeEvaluation.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderStarRating("content", "Qualité du contenu")}
                {renderStarRating("instructor", "Qualité du formateur")}
                {renderStarRating("materials", "Supports pédagogiques")}
                {renderStarRating("overall", "Satisfaction générale")}
              </div>

              <div>
                <Label className="text-sm font-medium">Recommanderiez-vous cette formation ?</Label>
                <RadioGroup
                  value={wouldRecommend?.toString() || ""}
                  onValueChange={(value) => setWouldRecommend(value === "true")}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="recommend-yes" />
                    <Label htmlFor="recommend-yes">Oui, je la recommande</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="recommend-no" />
                    <Label htmlFor="recommend-no">Non, je ne la recommande pas</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="feedback">Commentaires et suggestions (optionnel)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Partagez vos commentaires sur la formation, ce qui vous a plu, ce qui pourrait être amélioré..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={submitEvaluation}
                  disabled={
                    !ratings.content ||
                    !ratings.instructor ||
                    !ratings.materials ||
                    !ratings.overall ||
                    wouldRecommend === null
                  }
                >
                  Soumettre l'évaluation
                </Button>
                <Button variant="outline" onClick={() => setActiveEvaluation(null)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Formations à évaluer</h3>
              {completedTrainings.length > 0 ? (
                <div className="space-y-3">
                  {completedTrainings.map((training) => (
                    <div key={training.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{training.title}</h4>
                        <div className="flex items-center gap-2">
                          {evaluatedIds.includes(training.id) ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Évaluée
                            </Badge>
                          ) : (
                            <Badge variant="default">À évaluer</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {training.instructor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {training.duration}
                        </span>
                        <span>{new Date(training.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{training.description}</p>
                      {!evaluatedIds.includes(training.id) && (
                        <Button size="sm" onClick={() => setActiveEvaluation(training)}>
                          Évaluer cette formation
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune formation complétée à évaluer pour le moment</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation History */}
      {evaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des Évaluations</CardTitle>
            <CardDescription>Vos précédentes évaluations de formation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations.slice(0, 3).map((evaluation) => {
                const training = trainings.find((t) => t.id === evaluation.trainingId)
                if (!training) return null

                return (
                  <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{training.title}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        <span className="text-sm font-medium">{evaluation.ratings.overall}/5</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>Contenu: {evaluation.ratings.content}/5</div>
                      <div>Formateur: {evaluation.ratings.instructor}/5</div>
                      <div>Supports: {evaluation.ratings.materials}/5</div>
                      <div>Recommande: {evaluation.wouldRecommend ? "Oui" : "Non"}</div>
                    </div>
                    {evaluation.feedback && <p className="text-gray-700 text-sm italic">"{evaluation.feedback}"</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Évaluée le {new Date(evaluation.submittedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
