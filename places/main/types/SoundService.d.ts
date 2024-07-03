interface SoundService extends Instance {
  SoundEffects: SoundGroup & {
    PageOpen: Sound;
    PageClose: Sound;
    Select: Sound;
    Error: Sound;
    Tick: Sound;
    Place: Sound;
    Damaged: Sound;
  };
}