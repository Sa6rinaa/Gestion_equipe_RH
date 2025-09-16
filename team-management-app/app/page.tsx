"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import EmployeeDashboard from "@/components/employee-dashboard"
import AdminDashboard from "@/components/admin-dashboard"

export default function TeamManagementApp() {
  const [userRole, setUserRole] = useState<"employee" | "admin">("employee")
  const [currentUser, setCurrentUser] = useState("John Doe")

  // Simulate user authentication
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as "employee" | "admin"
    if (savedRole) {
      setUserRole(savedRole)
    }
  }, [])

  const toggleRole = () => {
    const newRole = userRole === "employee" ? "admin" : "employee"
    setUserRole(newRole)
    localStorage.setItem("userRole", newRole)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TeamPulse</h1>
                <p className="text-sm text-gray-500">Gestion d'équipe moderne</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant={userRole === "admin" ? "default" : "secondary"}>
                {userRole === "admin" ? "Administrateur" : "Employé"}
              </Badge>
              <Button variant="outline" size="sm" onClick={toggleRole} className="text-sm bg-transparent">
                Basculer vers {userRole === "admin" ? "Employé" : "Admin"}
              </Button>
              <div className="text-sm text-gray-700 font-medium">{currentUser}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === "employee" ? <EmployeeDashboard /> : <AdminDashboard />}
      </main>
    </div>
  )
}
