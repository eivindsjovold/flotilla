import { Table, Typography } from '@equinor/eds-core-react'
import { useApi } from 'api/ApiCaller'
import { Mission, MissionStatus } from 'models/Mission'
import { useEffect, useState } from 'react'
import { HistoricMissionCard } from './HistoricMissionCard'
import { compareDesc } from 'date-fns'
import { RefreshProps } from './HistoricMissionPage'
import styled from 'styled-components'
import { Text } from 'components/Contexts/LanguageContext'
import { useErrorHandler } from 'react-error-boundary'
import { compareByDate } from 'utils/filtersAndSorts'

const TableWithHeader = styled.div`
    width: 600px;
    gap: 2rem;
`

const ScrollableTable = styled.div`
    display: grid;
    max-height: 250px;
    overflow: auto;
`

export function HistoricMissionView({ refreshInterval }: RefreshProps) {
    const handleError = useErrorHandler()

    const completedStatuses = [
        MissionStatus.Aborted,
        MissionStatus.Cancelled,
        MissionStatus.Successful,
        MissionStatus.PartiallySuccessful,
        MissionStatus.Failed,
    ]
    const apiCaller = useApi()
    const [completedMissions, setCompletedMissions] = useState<Mission[]>([])

    useEffect(() => {
        const id = setInterval(() => {
            updateCompletedMissions()
        }, refreshInterval)
        return () => clearInterval(id)
    }, [])

    const updateCompletedMissions = () => {
        apiCaller.getMissions().then((missions) => {
            setCompletedMissions(
                missions
                    .filter((m) => completedStatuses.includes(m.status))
                    .sort((a, b) => compareByDate(a.endTime, b.endTime))
            )
        })
        //.catch((e) => handleError(e))
    }

    var missionsDisplay = completedMissions.map(function (mission, index) {
        return <HistoricMissionCard key={index} index={index} mission={mission} />
    })

    return (
        <TableWithHeader>
            <Typography variant="h1">{Text('Historic Missions')}</Typography>
            <ScrollableTable>
                <Table>
                    <Table.Head sticky>
                        <Table.Row>
                            <Table.Cell>{Text('Status')}</Table.Cell>
                            <Table.Cell>{Text('Name')}</Table.Cell>
                            <Table.Cell>{Text('Completion Time')}</Table.Cell>
                        </Table.Row>
                    </Table.Head>
                    <Table.Body>{missionsDisplay}</Table.Body>
                </Table>
            </ScrollableTable>
        </TableWithHeader>
    )
}
