import { ArrowLeft, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Политика конфиденциальности</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* PDF Viewer Container */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Политика конфиденциальности
                    </h2>
                    <p className="text-sm text-gray-500">
                      Информация о защите персональных данных пользователей
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Скачать PDF
                </Button>
              </div>
            </div>

            {/* PDF Embed */}
            <div className="p-6">
              <div className="w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    PDF документ
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Здесь будет отображен PDF файл с политикой конфиденциальности
                  </p>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Загрузить документ
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="mt-6 bg-green-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Основные принципы защиты данных:
            </h3>
            <ul className="space-y-2 text-green-800">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                Мы собираем только необходимые для работы сервиса данные
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                Персональные данные надежно защищены и зашифрованы
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                Мы не передаем данные третьим лицам без согласия
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                Пользователи могут запросить удаление своих данных
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                Все платежные данные обрабатываются через защищенные системы
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}