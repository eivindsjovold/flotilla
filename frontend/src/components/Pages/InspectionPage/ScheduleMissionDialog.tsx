import { Autocomplete, Button, Card, Dialog, Typography, Popover, Icon } from '@equinor/eds-core-react'
import styled from 'styled-components'
import { useLanguageContext } from 'components/Contexts/LanguageContext'
import { Icons } from 'utils/icons'
import { useRef, useState, useEffect } from 'react'
import { useInstallationContext } from 'components/Contexts/InstallationContext'
import { Robot } from 'models/Robot'
import { MissionDefinition } from 'models/MissionDefinition'
import { BackendAPICaller } from 'api/ApiCaller'

interface IProps {
    mission: MissionDefinition
    refreshInterval: number
    closeDialog: () => void
}

const StyledMissionDialog = styled.div`
    display: flex;
    justify-content: space-between;
`
const StyledAutoComplete = styled(Card)`
    display: flex;
    justify-content: center;
    padding: 8px;
    gap: 25px;
`
const StyledMissionSection = styled.div`
    display: flex;
    margin-left: auto;
    margin-right: 0;
    gap: 10px;
`
const StyledLoading = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3rem;
    gap: 1rem;
`
const StyledDialog = styled(Dialog)`
    display: flex;
    padding: 1rem;
    width: 320px;
`

export const ScheduleMissionDialog = (props: IProps): JSX.Element => {
    const { TranslateText } = useLanguageContext()
    const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
    const [selectedRobot, setSelectedRobot] = useState<Robot>()
    const [robotOptions, setRobotOptions] = useState<Robot[]>([])
    const anchorRef = useRef<HTMLButtonElement>(null)
    const { installationCode } = useInstallationContext()

    useEffect(() => {
        const id = setInterval(() => {
            BackendAPICaller.getEnabledRobots().then((robots) => {
                setRobotOptions(robots)
            })
        }, props.refreshInterval)
        return () => clearInterval(id)
    }, [props.refreshInterval])

    let timer: ReturnType<typeof setTimeout>

    const onSelectedRobot = (selectedRobot: Robot) => {
        if (robotOptions === undefined) return

        setSelectedRobot(selectedRobot)
    }

    const onScheduleButtonPress = () => {
        if (selectedRobot === undefined) return

        BackendAPICaller.scheduleMissionDefinition(props.mission.id, selectedRobot.id)

        setSelectedRobot(undefined)
    }

    const closePopover = () => setIsPopoverOpen(false)

    const handleClose = () => {
        clearTimeout(timer)
        closePopover()
    }

    return (
        <>
            <Popover
                anchorEl={anchorRef.current}
                onClose={handleClose}
                open={isPopoverOpen && installationCode === ''}
                placement="top"
            >
                <Popover.Content>
                    <Typography variant="body_short">{TranslateText('Please select installation')}</Typography>
                </Popover.Content>
            </Popover>

            <StyledMissionDialog>
                <StyledDialog open={true}>
                    <StyledAutoComplete>
                        <StyledMissionSection>
                            <Button
                                onClick={() => {
                                    props.closeDialog()
                                }}
                                variant="outlined"
                                color="primary"
                            >
                                {' '}
                                {TranslateText('Cancel')}{' '}
                            </Button>
                        </StyledMissionSection>
                    </StyledAutoComplete>
                </StyledDialog>
            </StyledMissionDialog>

            <StyledMissionDialog>
                <Dialog open={true}>
                    <StyledAutoComplete>
                        <Typography variant="h5">{TranslateText('This installation has no missions')}</Typography>
                    </StyledAutoComplete>
                </Dialog>
            </StyledMissionDialog>

            <StyledMissionDialog>
                <StyledDialog open={true}>
                    <StyledAutoComplete>
                        <Autocomplete
                            optionLabel={(r) => r.name + ' (' + r.model.type + ')'}
                            options={robotOptions.filter(
                                (r) =>
                                    r.currentInstallation.toLocaleLowerCase() === installationCode.toLocaleLowerCase()
                            )}
                            label={TranslateText('Select robot')}
                            onOptionsChange={(changes) => onSelectedRobot(changes.selectedItems[0])}
                            autoWidth={true}
                            onFocus={(e) => e.preventDefault()}
                        />
                        <StyledMissionSection>
                            <Button
                                onClick={() => {
                                    props.closeDialog()
                                }}
                                variant="outlined"
                                color="primary"
                            >
                                {' '}
                                {TranslateText('Cancel')}{' '}
                            </Button>
                            <Button
                                onClick={() => {
                                    onScheduleButtonPress()
                                    props.closeDialog()
                                }}
                                disabled={!selectedRobot}
                            >
                                {' '}
                                {TranslateText('Queue mission')}
                            </Button>
                        </StyledMissionSection>
                    </StyledAutoComplete>
                </StyledDialog>
            </StyledMissionDialog>
        </>
    )
}