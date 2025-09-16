"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, BarChart3, BookOpen } from "lucide-react"
import MoodTracker from "./mood-tracker"
import FeedbackForm from "./feedback-form"
import SurveyManager from "./survey-manager"
import TrainingEvaluation from "./training-evaluation"

interface DashboardStats {
  weeklyMoodAverage: number
  feedbackSubmitted: number
  surveysCompleted: number
  trainingsCompleted: number
}

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    weeklyMoodAverage: 0,
    feedbackSubmitted: 0,
    surveysCompleted: 0,
    trainingsCompleted: 0,
  })

  useEffect(() => {
    // Load stats from localStorage
    const loadStats = () => {
      const moods = JSON.parse(localStorage.getItem("userMoods") || "[]")
      const feedbacks = JSON.parse(localStorage.getItem("userFeedbacks") || "[]")
      const surveys = JSON.parse(localStorage.getItem("completedSurveys") || "[]")
      const trainings = JSON.parse(localStorage.getItem("completedTrainings") || "[]")

      const weeklyMoods = moods.filter((mood: any) => {
        const moodDate = new Date(mood.date)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return moodDate >= weekAgo
      })

      const avgMood =
        weeklyMoods.length > 0
          ? weeklyMoods.reduce((sum: number, mood: any) => sum + mood.value, 0) / weeklyMoods.length
          : 0

      setStats({
        weeklyMoodAverage: Math.round(avgMood * 10) / 10,
        feedbackSubmitted: feedbacks.length,
        surveysCompleted: surveys.length,
        trainingsCompleted: trainings.length,
      })
    }

    loadStats()

    // Listen for storage changes
    const handleStorageChange = () => loadStats()
    window.addEventListener("storage", handleStorageChange)

    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const statCards = [
    {
      title: "Humeur Moyenne",
      value: stats.weeklyMoodAverage.toFixed(1),
      description: "Cette semaine",
      icon: Heart,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      title: "Feedbacks Envoyés",
      value: stats.feedbackSubmitted.toString(),
      description: "Total soumis",
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Sondages Complétés",
      value: stats.surveysCompleted.toString(),
      description: "Participation active",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Formations Évaluées",
      value: stats.trainingsCompleted.toString(),
      description: "Évaluations soumises",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Employé</h2>
        <p className="text-gray-600">Suivez votre bien-être et participez à l'amélioration de l'entreprise</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="mood" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Humeur
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="surveys" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Sondages
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Formations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mood">
          <MoodTracker />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackForm />
        </TabsContent>

        <TabsContent value="surveys">
          <SurveyManager userRole="employee" />
        </TabsContent>

        <TabsContent value="training">
          <TrainingEvaluation />
        </TabsContent>
      </Tabs>
    </div>
  )
}
