import { Button, Typography } from '@equinor/eds-core-react'
import { config } from 'config'
import { Mission, MissionStatus } from 'models/Mission'
import styled from 'styled-components'
import { MissionStatusDisplay } from '../Pages/FrontPage/MissionOverview/MissionStatusDisplay'
import { useNavigate } from 'react-router-dom'
import { useLanguageContext } from 'components/Contexts/LanguageContext'

const Indent = styled.div`
    padding: 0px 9px;
`

interface MissionsProps {
    missions: Mission[]
}

function FailedMission({ missions }: MissionsProps) {
    const mission = missions[0]
    const { TranslateText } = useLanguageContext()
    const navigate = useNavigate()
    const goToMission = () => {
        const path = `${config.FRONTEND_BASE_ROUTE}/mission/${mission.id}`
        navigate(path)
    }

    return (
        <Button as={Typography} onClick={goToMission} variant="ghost" color="secondary">
            <strong>'{mission.name}'</strong> {TranslateText('failed on robot')}{' '}
            <strong>'{mission.robot.name}':</strong> {mission.statusReason}
        </Button>
    )
}

function SeveralFailedMissions({ missions }: MissionsProps) {
    const { TranslateText } = useLanguageContext()
    const navigate = useNavigate()
    const goToHistory = () => {
        const path = `${config.FRONTEND_BASE_ROUTE}/history`
        navigate(path)
    }

    return (
        <Button as={Typography} onClick={goToHistory} variant="ghost" color="secondary">
            <strong>{missions.length}</strong>{' '}
            {' ' + TranslateText("missions failed recently. See 'Mission History' for more information.")}
        </Button>
    )
}

export function FailedMissionAlertContent({ missions }: MissionsProps) {
    return (
        <>
            <MissionStatusDisplay status={MissionStatus.Failed} />
            <Indent>
                {missions.length === 1 && <FailedMission missions={missions} />}
                {missions.length > 1 && <SeveralFailedMissions missions={missions} />}
            </Indent>
        </>
    )
}