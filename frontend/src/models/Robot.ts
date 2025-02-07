import { BatteryStatus } from './Battery'
import { Pose } from './Pose'
import { VideoStream } from './VideoStream'

export enum RobotStatus {
    Available = 'Available',
    Offline = 'Offline',
    MissionInProgress = 'Mission in progress',
}

export enum RobotType {
    Taurob = 'Taurob',
    ExRobotics = 'ExRobotics',
    TurtleBot = 'TurtleBot',
    NoneType = 'NoneType',
}

export interface Robot {
    id: string
    name?: string
    model: RobotType
    serialNumber?: string
    batteryLevel?: number
    batteryStatus?: BatteryStatus
    pose?: Pose
    status?: RobotStatus
    enabled?: boolean
    host?: string
    logs?: string
    port?: number
    videoStreams?: VideoStream[]
    isarUri?: string
}
