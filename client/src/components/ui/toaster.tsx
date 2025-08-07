import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Скрываем кнопку закрытия для уведомлений о поисковых запросах и ошибке копирования
        const hideCloseButton = title === "Поисковый запрос сохранён" || title === "Поисковый запрос удален" || title === "Ошибка"
        
        // Принудительно закрываем уведомления о поисковых запросах, ошибках и фотографиях через 1 секунду
        const forceAutoClose = title === "Поисковый запрос удален" || 
                              title === "Поисковый запрос сохранён" || 
                              title === "Ошибка" || 
                              (title && title.startsWith("Фотографии готовы"))
        
        return (
          <Toast 
            key={id} 
            {...props}
            duration={forceAutoClose ? 1000 : props.duration}
            onPause={forceAutoClose ? undefined : props.onPause}
            onResume={forceAutoClose ? undefined : props.onResume}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            {!hideCloseButton && <ToastClose />}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
