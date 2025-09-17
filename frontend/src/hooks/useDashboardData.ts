import { useEffect, useState } from "react";

// ✅ Tipi per entità correlate
export type Notification = {
  id: number;
  message: string;
  timestamp: string;
};

export type UpcomingClass = {
  id: number;
  title: string;
  date: string;
};

export type Activity = {
  description: string;
  timestamp: string;
};

// ✅ Tipo principale esportato
export type DashboardData = {
  greeting: string;
  bookedClasses: number;
  completedClasses: number;
  remainingCredits: number;
  todayClasses: number;
  totalStudents: number;
  hoursThisMonth: number;
  activeStudents: number;
  monthlyRevenue: string | number;
  unreadNotifications: number;
  notifications: Notification[];
  upcomingClasses: UpcomingClass[];
  recentActivity: Activity[];
};

// Hook principale
export function useDashboardData(userRole: "STUDENT" | "INSTRUCTOR" | "ADMIN" | "STAFF") {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    try {
      // Dati di default → evita undefined/null
      let newData: DashboardData = {
        greeting: "",
        bookedClasses: 0,
        completedClasses: 0,
        remainingCredits: 0,
        todayClasses: 0,
        totalStudents: 0,
        hoursThisMonth: 0,
        activeStudents: 0,
        monthlyRevenue: 0,
        unreadNotifications: 0,
        notifications: [],
        upcomingClasses: [],
        recentActivity: []
      };

      // STUDENT
      if (userRole === "STUDENT") {
        newData = {
          ...newData,
          greeting: "Buon pomeriggio, Demo Studente!",
          bookedClasses: 3,
          completedClasses: 5,
          remainingCredits: 8,
          unreadNotifications: 2,
          notifications: [
            { id: 1, message: "La tua lezione di Salsa è alle 18:00", timestamp: "1h fa" },
            { id: 2, message: "Hai completato il corso Hip Hop Base 🎉", timestamp: "ieri" }
          ],
          upcomingClasses: [
            { id: 1, title: "Hip Hop Fundamentals", date: "2025-09-20 18:00" },
            { id: 2, title: "Contemporary Basics", date: "2025-09-22 19:30" }
          ]
        };
      }

      // INSTRUCTOR
      if (userRole === "INSTRUCTOR") {
        newData = {
          ...newData,
          greeting: "Buon pomeriggio, Demo Istruttore!",
          todayClasses: 2,
          totalStudents: 24,
          hoursThisMonth: 18,
          unreadNotifications: 1,
          notifications: [
            { id: 1, message: "Nuovo studente iscritto a Tango", timestamp: "2h fa" }
          ],
          upcomingClasses: [
            { id: 1, title: "Lezione Salsa Avanzata", date: "2025-09-20 17:00" },
            { id: 2, title: "Workshop Tango", date: "2025-09-21 20:00" }
          ]
        };
      }

      // ADMIN
      if (userRole === "ADMIN") {
        newData = {
          ...newData,
          greeting: "Buon pomeriggio, Demo Admin!",
          activeStudents: 56,
          todayClasses: 4,
          monthlyRevenue: "3200",
          recentActivity: [
            { description: "Nuovo corso creato: Hip Hop Base", timestamp: "3h fa" },
            { description: "Studente Mario Rossi si è registrato", timestamp: "ieri" }
          ],
          upcomingClasses: [
            { id: 1, title: "Riunione Staff", date: "2025-09-23 15:00" }
          ]
        };
      }

      // STAFF
      if (userRole === "STAFF") {
        newData = {
          ...newData,
          greeting: "Buon pomeriggio, Demo Staff!",
          todayClasses: 1,
          activeStudents: 30,
          monthlyRevenue: "700",
          unreadNotifications: 3,
          notifications: [
            { id: 1, message: "Supporto richiesto da Giulia Verdi", timestamp: "20m fa" }
          ],
          upcomingClasses: [
            { id: 1, title: "Assistenza Corso Hip Hop", date: "2025-09-20 16:30" }
          ]
        };
      }

      setData(newData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  return { data, isLoading, error };
}