const DEFAULT_GRAVITY = 196.2;
const ACCURACY = 3;

/**
 * Returns the time it would take for a projectile starting from `origin` to travel
 * @param origin Where the shot was fired from
 * @param target The target being reached
 * @param speed Projectile speed
 * @param gravity World gravity
 */
export function getTimeToReach(origin: Vector3, target: Vector3, speed: number, gravity = DEFAULT_GRAVITY): number {
  const distance = target.sub(origin).Magnitude;
  return distance / speed;
}

/**
 * Returns a position ahead of the target based on projectile speed, target speed, and gravity.
 * @param origin Where the shot was fired from
 * @param target The current position of the target
 * @param targetVelocity The velocity of the target
 * @param speed Projectile speed
 * @param gravity World gravity
 */
export function findLeadShot(origin: Vector3, target: Vector3, targetVelocity: Vector3, speed: number, gravity = DEFAULT_GRAVITY): Vector3 {
  const timeToReach = getTimeToReach(origin, target, speed, gravity);
  return new Vector3(
    target.X + targetVelocity.X * timeToReach,
    target.Y + targetVelocity.Y * timeToReach,
    target.Z + targetVelocity.Z * timeToReach
  );
}