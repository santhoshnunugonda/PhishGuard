import { createClient } from './supabase';

export async function updateUserStats(points: number, activityType: string, title: string, result: 'correct' | 'incorrect' | 'completed') {
  console.log('[updateUserStats] Starting with:', { points, activityType, title, result });
  
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    console.error('[updateUserStats] No authenticated user found:', userError);
    return null;
  }
  
  console.log('[updateUserStats] User authenticated:', user.id);

  const today = new Date().toISOString().split('T')[0];

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('total_points, streak, daily_streak, last_activity_date, last_daily_challenge, scenarios_completed, accuracy, modules_completed, rank')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[updateUserStats] Profile not found:', profileError);
    return null;
  }
  
  console.log('[updateUserStats] Profile found:', { total_points: profile.total_points, streak: profile.streak });

  let newStreak = profile.streak || 0;
  const lastDate = profile.last_activity_date;

  if (lastDate) {
    const lastActivityDate = new Date(lastDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastActivityDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
    } else if (diffDays === 1) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  let newDailyStreak = profile.daily_streak || 0;
  let newLastDailyChallenge = profile.last_daily_challenge;

  if (activityType === 'daily_challenge') {
    const lastDailyDate = profile.last_daily_challenge;
    if (lastDailyDate) {
      const lastChallengeDate = new Date(lastDailyDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastChallengeDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
      } else if (diffDays === 1) {
        newDailyStreak += 1;
      } else {
        newDailyStreak = 1;
      }
    } else {
      newDailyStreak = 1;
    }
    newLastDailyChallenge = today;
  }

  const newTotal = (profile.total_points || 0) + points;
  const newScenariosCompleted = (profile.scenarios_completed || 0) + (activityType === 'simulation' || activityType === 'daily_challenge' ? 1 : 0);
  const newModulesCompleted = (profile.modules_completed || 0) + (activityType === 'module' ? 1 : 0);
  
  const { count: totalAttempts } = await supabase
    .from('user_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('activity_type', ['simulation', 'daily_challenge']);

  const { count: correctAttempts } = await supabase
    .from('user_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('activity_type', ['simulation', 'daily_challenge'])
    .eq('result', 'correct');

  const pendingCorrect = result === 'correct' ? 1 : 0;
  const pendingTotal = (activityType === 'simulation' || activityType === 'daily_challenge') ? 1 : 0;
  const newAccuracy = ((correctAttempts || 0) + pendingCorrect) > 0 && ((totalAttempts || 0) + pendingTotal) > 0
    ? Math.round((((correctAttempts || 0) + pendingCorrect) / ((totalAttempts || 0) + pendingTotal)) * 100)
    : profile.accuracy || 0;
  
  let newLevel = 1;
  let levelName = 'Beginner';
  if (newTotal >= 3000) {
    newLevel = 4;
    levelName = 'Expert';
  } else if (newTotal >= 1500) {
    newLevel = 3;
    levelName = 'Advanced';
  } else if (newTotal >= 500) {
    newLevel = 2;
    levelName = 'Intermediate';
  }

  const newRiskScore = Math.max(0, 100 - Math.floor(newTotal / 50));

  const { error: updateError } = await supabase.rpc('update_user_profile_stats', {
    user_id_param: user.id,
    new_total_points: newTotal,
    new_streak: newStreak,
    new_daily_streak: newDailyStreak,
    new_last_activity_date: today,
    new_last_daily_challenge: newLastDailyChallenge,
    new_scenarios_completed: newScenariosCompleted,
    new_modules_completed: newModulesCompleted,
    new_level: newLevel,
    new_level_name: levelName,
    new_risk_score: newRiskScore,
    new_accuracy: newAccuracy,
  });

  if (updateError) {
    console.error('[updateUserStats] Error updating profile via RPC:', updateError);
  } else {
    console.log('[updateUserStats] Profile updated successfully via RPC');
  }

  const { error: activityError } = await supabase.rpc('insert_user_activity', {
    user_id_param: user.id,
    activity_type_param: activityType,
    title_param: title,
    result_param: result,
    points_param: points,
  });

  if (activityError) {
    console.error('[updateUserStats] Error inserting activity via RPC:', activityError);
  } else {
    console.log('[updateUserStats] Activity inserted successfully via RPC');
  }

  const badgeChecks = [
    { id: 'first-steps', name: 'First Steps', icon: '🎓', condition: newModulesCompleted >= 1, total: 1 },
    { id: 'eager-learner', name: 'Eager Learner', icon: '📚', condition: newModulesCompleted >= 3, total: 3 },
    { id: 'knowledge-seeker', name: 'Knowledge Seeker', icon: '🧠', condition: newModulesCompleted >= 8, total: 8 },
    { id: 'phish-spotter', name: 'Phish Spotter', icon: '🎣', condition: newScenariosCompleted >= 1, total: 1 },
    { id: 'eagle-eye', name: 'Eagle Eye', icon: '🦅', condition: newScenariosCompleted >= 5, total: 5 },
    { id: 'phish-hunter', name: 'Phish Hunter', icon: '🏹', condition: newScenariosCompleted >= 10, total: 10 },
    { id: 'daily-warrior', name: 'Daily Warrior', icon: '⚔️', condition: newDailyStreak >= 1, total: 1 },
    { id: 'week-streak', name: 'Week Warrior', icon: '🔥', condition: newDailyStreak >= 7, total: 7 },
    { id: 'month-streak', name: 'Unstoppable', icon: '💪', condition: newDailyStreak >= 30, total: 30 },
    { id: 'century-club', name: 'Century Club', icon: '💯', condition: newTotal >= 100, total: 100 },
    { id: 'rising-star', name: 'Rising Star', icon: '⭐', condition: newTotal >= 500, total: 500 },
    { id: 'point-master', name: 'Point Master', icon: '🏆', condition: newTotal >= 1000, total: 1000 },
    { id: 'security-champion', name: 'Security Champion', icon: '👑', condition: profile.rank && profile.rank <= 10, total: 1 },
  ];

  for (const badge of badgeChecks) {
    let currentProgress = 0;
    if (badge.id.includes('learner') || badge.id.includes('seeker') || badge.id === 'first-steps') currentProgress = newModulesCompleted;
    else if (badge.id.includes('phish') || badge.id === 'eagle-eye') currentProgress = newScenariosCompleted;
    else if (badge.id.includes('streak') || badge.id === 'daily-warrior') currentProgress = newDailyStreak;
    else if (badge.id.includes('point') || badge.id.includes('century') || badge.id === 'rising-star') currentProgress = newTotal;

    await supabase.rpc('upsert_user_badge', {
      user_id_param: user.id,
      badge_name_param: badge.name,
      badge_icon_param: badge.icon,
      earned_param: badge.condition,
      progress_param: Math.min(currentProgress, badge.total),
      total_param: badge.total,
    });
  }

  await updateGlobalRankings();

  return {
    newTotal,
    newStreak,
    newDailyStreak,
    newLevel,
    levelName,
  };
}

export async function updateGlobalRankings() {
  const supabase = createClient();
  
  const { error } = await supabase.rpc('update_global_rankings');

  if (error) {
    console.error('[updateGlobalRankings] Error:', error);
  } else {
    console.log('[updateGlobalRankings] Rankings updated successfully');
  }
}
