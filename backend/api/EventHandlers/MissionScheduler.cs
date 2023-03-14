﻿using Api.Controllers;
using Api.Database.Models;
using Api.Services;
using Api.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace Api.EventHandlers
{
    public class MissionScheduler : BackgroundService
    {
        private readonly ILogger<MissionScheduler> _logger;
        private readonly int _timeDelay;
        private readonly IServiceScopeFactory _scopeFactory;

        private IList<Mission> MissionQueue =>
            MissionService.ReadAll(null, MissionStatus.Pending).Result;

        private IMissionService MissionService =>
            _scopeFactory.CreateScope().ServiceProvider.GetRequiredService<IMissionService>();

        private RobotController RobotController =>
            _scopeFactory.CreateScope().ServiceProvider.GetRequiredService<RobotController>();

        public MissionScheduler(ILogger<MissionScheduler> logger, IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _timeDelay = 1000; // 1 second
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                foreach (var queuedMission in MissionQueue)
                {
                    var freshMission = MissionService.ReadById(queuedMission.Id).Result;
                    if (freshMission == null)
                    {
                        continue;
                    }
                    if (
                        freshMission.Robot.Status is not RobotStatus.Available
                        || freshMission.DesiredStartTime > DateTimeOffset.UtcNow
                    )
                    {
                        continue;
                    }

                    bool startedSuccessfull = await StartMission(queuedMission);
                    if (!startedSuccessfull)
                    {
                        var newStatus = MissionStatus.Failed;
                        _logger.LogWarning(
                            "Mission {id} was not started successfully. Status updated to '{status}'",
                            queuedMission.Id,
                            newStatus
                        );
                        queuedMission.Status = newStatus;
                        await MissionService.Update(queuedMission);
                    }
                }
                await Task.Delay(_timeDelay, stoppingToken);
            }
        }

        private async Task<bool> StartMission(Mission scheduledMission)
        {
            try
            {
                var result = await RobotController.StartMission(
                    scheduledMission.Robot.Id,
                    scheduledMission.Id
                );
                if (result.Result is not OkObjectResult)
                {
                    throw new MissionException(
                        result?.Result?.ToString() ?? "Unknown error from robot controller"
                    );
                }
                _logger.LogInformation("Started mission '{id}'", scheduledMission.Id);
            }
            catch (MissionException e)
            {
                _logger.LogError(e, "Failed to start mission '{id}'", scheduledMission.Id);
                return false;
            }
            return true;
        }
    }
}
