declare global {
  var mongoose: {
    conn: any;
    promise: Promise<any> | null;
  };
}

export enum QKey {
  scenarios = 'scenarios',
  scenario = 'scenario',
  controls = 'controls',
  control = 'control',
}
