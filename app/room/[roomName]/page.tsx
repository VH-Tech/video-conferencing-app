import VideoRoom from '@/components/VideoRoom'

interface RoomPageProps {
  params: Promise<{
    roomName: string
  }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomName } = await params
  const roomUrl = `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN}.daily.co/${roomName}`

  return (
    <div className="h-screen w-screen bg-gray-900 p-4">
      <VideoRoom roomUrl={roomUrl} />
    </div>
  )
}
