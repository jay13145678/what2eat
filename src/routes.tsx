/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react'
import { createHashRouter } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'

const PickerPage = lazy(() => import('./pages/PickerPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const DishDetailPage = lazy(() => import('./pages/DishDetailPage'))

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center text-ink/50">
      加载中...
    </div>
  )
}

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <PickerPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Loading />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'dish/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <DishDetailPage />
          </Suspense>
        ),
      },
    ],
  },
])
