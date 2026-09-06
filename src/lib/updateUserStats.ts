'use server';

import { createClient } from '@supabase/supabase-js';

export async function saveModuleProgress(userId: string, moduleId: string, score: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  await supabase
    .from('user_module_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      quiz_score: score,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,module_id' });
}

export async function updateUserStats(userId: string, points: number, activityType: string, title: string, result: 'correct' | 'incorrect' | 'completed') {
  console.log('[updateUserStats] Starting with:', { userId, points, activityType, title, result });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const today = new Date().toISOString().split('T')[0];

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('total_points, streak, daily_streak, last_activity_date, last_daily_challenge, scenarios_completed, accuracy, modules_completed, rank')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('[updateUserStats] Profile not found:', profileError);
    return null;
  }

  let newStreak = profile.streak || 0;
  const lastDate = profile.last_activity_date;

  if (lastDate) {
    const lastActivityDate = new Date(lastDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastActivityDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
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

      if (diffDays === 1) {
        newDailyStreak += 1;
      } else if (diffDays > 1) {
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
    .eq('user_id', userId)
    .in('activity_type', ['simulation', 'daily_challenge']);

  const { count: correctAttempts } = await supabase
    .from('user_activity')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
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

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      total_points: newTotal,
      streak: newStreak,
      daily_streak: newDailyStreak,
      last_activity_date: today,
      last_daily_challenge: newLastDailyChallenge,
      scenarios_completed: newScenariosCompleted,
      modules_completed: newModulesCompleted,
      level: newLevel,
      level_name: levelName,
      risk_score: newRiskScore,
      accuracy: newAccuracy,
    })
    .eq('id', userId);

  if (updateError) {
    console.error('[updateUserStats] Error updating profile:', updateError);
  } else {
    console.log('[updateUserStats] Profile updated successfully');
  }

  // We can also insert user_activity using upsert or insert instead of RPC
  await supabase.from('user_activity').insert({
    user_id: userId,
    activity_type: activityType,
    title: title,
    result: result,
    points: points,
  });

  return {
    newTotal,
    newStreak,
    newDailyStreak,
    newLevel,
    levelName,
  };
}
