import React, { useState, useEffect, Component } from 'react'
import { useCookies } from 'react-cookie'
import { NodeService } from '../service/NodeService'
import { UserState } from '../service/serviceObject'
import * as TE from 'fp-ts/TaskEither'
import { zero } from 'fp-ts/Array'

export default function CheckLogin()
{
    const [cookiesUser, setCookieUser, removeCookieUser] = useCookies(['user'])
    const [cookiesId, setCookieId, removeCookieId] = useCookies(['id'])

    async function getLogin()
    {   
        const nodeservice = new NodeService()
        const data = await TE.match<Error, UserState, UserState>(
            (e) => {
            console.log(`Get Login State Error: ${e}`)
            return {} as UserState
            },
            (r) => r
        )(nodeservice.getLoginState())()
        console.log(data)
        return data
    }
    
    async function LoginLogic(){
        if(cookiesUser["user"]===undefined)
        {
            const userLogin = getLogin()
            console.log(userLogin)
        //if(userState.state)
        //window.location.pathname = "https://stackoverflow.com/questions/39826992/how-can-i-set-a-cookie-in-react"
        }
    }
    
    useEffect(() => {
    
    
    }, [])


    return (<div></div>)
}