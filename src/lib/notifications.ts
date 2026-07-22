import {supabase} from './supabase'; import type {NotificationPayload} from '../types';
export interface NotificationProvider{send(notification:NotificationPayload):Promise<void>}
export class InAppProvider implements NotificationProvider{async send(n:NotificationPayload){const {error}=await supabase.from('notifications').insert({user_id:n.userId,type:n.type,title:n.title,body:n.body,action_url:n.actionUrl});if(error)throw error}}
export class ConsoleProvider implements NotificationProvider{async send(n:NotificationPayload){console.info('[PlayNest notification]',n)}}
export class CompositeProvider implements NotificationProvider{constructor(private providers:NotificationProvider[]){}async send(n:NotificationPayload){await Promise.allSettled(this.providers.map(p=>p.send(n)))}}
