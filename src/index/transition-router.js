import {Location, Router} from '@reach/router'
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import React from 'react'

export function TransitionRouter({children}) {
  return (
    <Location>
      {({location}) => (
        <TransitionGroup className="transition-group" style={{height: '100%'}}>
          <CSSTransition key={location.key} classNames="page" timeout={300}>
            <Router location={location} className="page-wrapper" style={{height: '100%', width: '100%'}}>
              {children}
            </Router>
          </CSSTransition>
        </TransitionGroup>
      )}
    </Location>
  )
}
