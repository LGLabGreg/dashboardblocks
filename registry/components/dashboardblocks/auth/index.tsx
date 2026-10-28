import { Auth1, auth1ExampleProps } from './auth-01'
import { Auth2, auth2ExampleProps } from './auth-02'
import { Auth3, auth3ExampleProps } from './auth-03'
import { Auth4, auth4ExampleProps } from './auth-04'
import { Auth5, auth5ExampleProps } from './auth-05'
import { Auth6, auth6ExampleProps } from './auth-06'
import { Auth7, auth7ExampleProps } from './auth-07'

export const authComponents = {
  'auth-01': Auth1,
  'auth-02': Auth2,
  'auth-03': Auth3,
  'auth-04': Auth4,
  'auth-05': Auth5,
  'auth-06': Auth6,
  'auth-07': Auth7,
}

export const authExampleProps = {
  'auth-01': auth1ExampleProps,
  'auth-02': auth2ExampleProps,
  'auth-03': auth3ExampleProps,
  'auth-04': auth4ExampleProps,
  'auth-05': auth5ExampleProps,
  'auth-06': auth6ExampleProps,
  'auth-07': auth7ExampleProps,
}

export const authEmptyProps = {
  'auth-02': { invites: [], workspaces: [] },
}
