import { ArrowLeft, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Terms() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 main-content">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/profile")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Правила и условия</h1>
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
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Правила и условия использования
                    </h2>
                    <p className="text-sm text-gray-500">
                      Документ содержит полную информацию о правилах платформы
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Terms of Service Content */}
            <div className="p-6">
              <div className="prose prose-gray max-w-none">
                
                {/* Date */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    Дата вступления в силу: 14 января 2025 г.
                  </p>
                </div>

                {/* Welcome */}
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    Добро пожаловать на сайт Narxi Tu! Пожалуйста, внимательно ознакомьтесь с настоящими Условиями использования перед началом работы с нашим веб-сайтом.
                  </p>
                </div>

                {/* Section 1 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Общие положения</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Настоящие Условия регулируют использование вами сайта Narxi Tu (далее — «Сайт»), а также всех сервисов, предоставляемых на нём. Посещая или используя Сайт, вы соглашаетесь соблюдать данные Условия. Если вы не согласны с ними — пожалуйста, не используйте Сайт.
                  </p>
                </div>

                {/* Section 2 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Регистрация и аккаунт</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Для участия в торгах вы обязаны создать личный аккаунт, указав достоверную информацию. Пользователь несёт ответственность за конфиденциальность своих данных и всех действий, совершаемых через его аккаунт.
                  </p>
                </div>

                {/* Section 3 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Участие в торгах</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Пользователи могут участвовать в аукционах и делать ставки на транспортные средства. Все ставки являются обязательными. Победитель аукциона обязан произвести оплату в установленные сроки. Невыполнение этих обязательств может повлечь блокировку аккаунта.
                  </p>
                </div>

                {/* Section 4 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Ответственность и гарантии</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Narxi Tu предоставляет информацию о лотах в том виде, в каком она была получена от продавца. Мы не даём никаких гарантий на состояние транспортных средств. Покупатель несёт ответственность за проверку автомобиля до покупки.
                  </p>
                </div>

                {/* Section 5 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">5. Ограничение ответственности</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Narxi Tu не несёт ответственности за любые убытки или потери, возникшие в результате участия в торгах или использования информации с сайта.
                  </p>
                </div>

                {/* Section 6 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">6. Запрещённые действия</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Запрещается использовать Сайт в незаконных целях, передавать вредоносные программы, вмешиваться в работу платформы, а также создавать фальшивые аккаунты.
                  </p>
                </div>

                {/* Section 7 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">7. Изменения условий</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Администрация Narxi Tu оставляет за собой право в любое время вносить изменения в данные Условия. Продолжение использования Сайта после изменений означает ваше согласие с обновлённой редакцией.
                  </p>
                </div>

                {/* Section 8 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">8. Применимое право</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Настоящие Условия регулируются законодательством Республики Таджикистан. Все споры подлежат разрешению в соответствующих судах по месту регистрации компании.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Контакты</h3>
                    <p className="text-gray-700">
                      Если у вас есть вопросы по настоящим Условиям, свяжитесь с нами через форму обратной связи или по телефону поддержки Narxi Tu.
                    </p>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Важное уведомление</h4>
                      <p className="text-sm text-amber-800">
                        Использование платформы Narxi Tu означает ваше полное согласие с данными условиями. Регулярно проверяйте обновления данного документа.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  );
}