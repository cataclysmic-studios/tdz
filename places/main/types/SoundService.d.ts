interface SoundService extends Instance {
  SoundEffects: SoundGroup & {
    PageOpen: Sound;
    Select: Sound;
    PageClose: Sound;
    Error: Sound;
    Place: Sound;
  };
}