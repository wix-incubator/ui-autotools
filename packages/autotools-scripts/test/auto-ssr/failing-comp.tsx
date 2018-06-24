import * as React from 'react'

const FailingTestComp: React.SFC = () => {
  const accessDocument = () => {
    document.createElement('div')
  }

  accessDocument()
  return null
}

export {FailingTestComp}
