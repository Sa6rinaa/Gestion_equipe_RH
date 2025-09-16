"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, CheckCircle } from "lucide-react"

interface Feedback {
  id: string
  date: string
  category: string
  priority: "low" | "medium" | "high"
  message: string
  status: "sent" | "read" | "responded"
}

const categories = [
  "Environnement de travail",
  "Management",
  "Outils et équipements",
  "Formation",
  "Communication",
  "Bien-être",
  "Processus",
  "Autre",
]

const priorities = [
  { value: "low", label: "Basse", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "Haute", color: "bg-red-100 text-red-800" },
]

export default function FeedbackForm() {
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [message, setMessage] = useState("")
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    loadFeedbackHistory()
  }, [])

  const loadFeedbackHistory = () => {
    const saved = localStorage.getItem("userFeedbacks")
    if (saved) {
      setFeedbackHistory(JSON.parse(saved))
    }
  }

  const submitFeedback = async () => {
    if (!category || !message.trim()) return

    setIsSubmitting(true)

    const feedback: Feedback = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category,
      priority,
      message: message.trim(),
      status: "sent",
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedHistory = [feedback, ...feedbackHistory]
    setFeedbackHistory(updatedHistory)
    localStorage.setItem("userFeedbacks", JSON.stringify(updatedHistory))

    // Also save to global feedbacks for admin dashboard
    const allFeedbacks = JSON.parse(localStorage.getItem("allFeedbacks") || "[]")
    allFeedbacks.push({ ...feedback, userId: "current-user", userName: "John Doe" })
    localStorage.setItem("allFeedbacks", JSON.stringify(allFeedbacks))

    // Reset form
    setCategory("")
    setPriority("medium")
    setMessage("")
    setIsSubmitting(false)
    setShowSuccess(true)

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary">Envoyé</Badge>
      case "read":
        return <Badge variant="default">Lu</Badge>
      case "responded":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Répondu
          </Badge>
        )
      default:
        return <Badge variant="secondary">Envoyé</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Feedback Quotidien
          </CardTitle>
          <CardDescription>
            Partagez vos idées, suggestions ou préoccupations pour améliorer votre expérience de travail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Feedback envoyé avec succès !</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="message">Votre message</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre feedback, suggestion ou préoccupation..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">{message.length}/500 caractères</p>
          </div>

          <Button onClick={submitFeedback} disabled={!category || !message.trim() || isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer le feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Feedback History */}
      {feedbackHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des Feedbacks</CardTitle>
            <CardDescription>Vos précédents retours et leur statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackHistory.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{feedback.category}</Badge>
                      <Badge className={priorities.find((p) => p.value === feedback.priority)?.color}>
                        {priorities.find((p) => p.value === feedback.priority)?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(feedback.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700">{feedback.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
