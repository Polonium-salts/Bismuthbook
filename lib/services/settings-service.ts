import { supabase } from '@/lib/supabase'

export interface UserSettings {
  // 通知设置
  emailNotifications: boolean
  pushNotifications: boolean
  likeNotifications: boolean
  commentNotifications: boolean
  followNotifications: boolean
  weeklyDigest: boolean
  
  // 隐私设置
  profileVisibility: 'public' | 'followers' | 'private'
  showEmail: boolean
  showLocation: boolean
  allowDirectMessages: boolean
  showOnlineStatus: boolean
  
  // 显示设置
  theme: 'light' | 'dark' | 'system'
  language: string
  gridSize: 'small' | 'medium' | 'large'
  showNSFW: boolean
  autoplayGifs: boolean
}

export interface UserSettingsUpdate extends Partial<UserSettings> {}

class SettingsService {
  private static readonly DEFAULT_SETTINGS: UserSettings = {
    // 通知设置默认值
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,
    weeklyDigest: false,
    
    // 隐私设置默认值
    profileVisibility: 'public',
    showEmail: false,
    showLocation: true,
    allowDirectMessages: true,
    showOnlineStatus: true,
    
    // 显示设置默认值
    theme: 'system',
    language: 'zh-CN',
    gridSize: 'medium',
    showNSFW: false,
    autoplayGifs: true,
  }

  // 获取用户设置
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // 如果没有找到设置记录，返回默认设置
        if (error.code === 'PGRST116') {
          return SettingsService.DEFAULT_SETTINGS
        }
        throw error
      }

      // 合并数据库设置和默认设置，确保所有字段都存在
      return {
        ...SettingsService.DEFAULT_SETTINGS,
        ...data.settings
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
      return SettingsService.DEFAULT_SETTINGS
    }
  }

  // 更新用户设置
  async updateUserSettings(userId: string, updates: UserSettingsUpdate): Promise<UserSettings> {
    try {
      // 首先获取当前设置
      const currentSettings = await this.getUserSettings(userId)
      
      // 合并更新
      const newSettings = {
        ...currentSettings,
        ...updates
      }

      // 尝试更新现有记录
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return newSettings
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  }

  // 重置用户设置为默认值
  async resetUserSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          settings: SettingsService.DEFAULT_SETTINGS,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return SettingsService.DEFAULT_SETTINGS
    } catch (error) {
      console.error('Error resetting user settings:', error)
      throw error
    }
  }

  // 获取默认设置
  getDefaultSettings(): UserSettings {
    return { ...SettingsService.DEFAULT_SETTINGS }
  }

  // 验证设置数据
  validateSettings(settings: Partial<UserSettings>): boolean {
    try {
      // 验证枚举值
      if (settings.profileVisibility && !['public', 'followers', 'private'].includes(settings.profileVisibility)) {
        return false
      }
      
      if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
        return false
      }
      
      if (settings.gridSize && !['small', 'medium', 'large'].includes(settings.gridSize)) {
        return false
      }

      // 验证布尔值
      const booleanFields = [
        'emailNotifications', 'pushNotifications', 'likeNotifications',
        'commentNotifications', 'followNotifications', 'weeklyDigest',
        'showEmail', 'showLocation', 'allowDirectMessages', 'showOnlineStatus',
        'showNSFW', 'autoplayGifs'
      ]

      for (const field of booleanFields) {
        if (settings[field as keyof UserSettings] !== undefined && 
            typeof settings[field as keyof UserSettings] !== 'boolean') {
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error validating settings:', error)
      return false
    }
  }
}

export const settingsService = new SettingsService()