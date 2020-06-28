import React, {useEffect} from 'react';
import {Center} from '../shared/center';
import {useFirestore, useFirestoreDoc, useUser} from 'reactfire';

export function Home() {
  const user = useUser()

  const userRef = useFirestore().collection('users').doc(user.uid)
  const userInfo = useFirestoreDoc(userRef)
  console.log(userInfo)

  useEffect(() => {
    // if (!userInfo.exists)
    //   userInfo.set({
    //     characters: [],
    //
    //   })
  }, [userInfo])

  return (
    <Center>
    </Center>
  )
}
