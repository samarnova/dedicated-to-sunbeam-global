document.addEventListener('DOMContentLoaded', () => {
    const profile = JSON.parse(localStorage.getItem('purrrfect-user-profile') || '{}');

    const name = profile.name || 'You';
    const vibe = profile.vibe || 'Balanced';
    const activities = profile.activities && profile.activities.length ? profile.activities : ['Coffee', 'Music', 'Reading'];
    const energy = Number(profile.energy) || 7;
    const dreamDay = profile.dreamDay || 'A cozy, creative, and peaceful day.';

    const scoreValue = document.getElementById('score-value');
    const moodSummary = document.getElementById('mood-summary');
    const moodPills = document.getElementById('mood-pills');
    const activityList = document.getElementById('activity-list');
    const styleList = document.getElementById('style-list');
    const energyValue = document.getElementById('energy-value');
    const energyCopy = document.getElementById('energy-copy');
    const dreamDayOutput = document.getElementById('dream-day-output');

    const score = Math.min(10, Math.max(1, Math.round((energy + (activities.length * 0.7)) / 2)));

    scoreValue.textContent = `${score} / 10`;
    moodSummary.textContent = `${name}, your perfect day feels ${vibe.toLowerCase()} and full of intention.`;

    const vibePills = [vibe, 'Joyful', 'Balanced'];
    vibePills.forEach((item) => {
        const pill = document.createElement('span');
        pill.className = 'pill';
        pill.textContent = item;
        moodPills.appendChild(pill);
    });

    activities.forEach((activity) => {
        const li = document.createElement('li');
        li.textContent = activity;
        activityList.appendChild(li);
    });

    const styleEntries = [
        `Your vibe is ${vibe.toLowerCase()}`,
        'You enjoy meaningful moments',
        'You like a sense of calm and flow'
    ];

    styleEntries.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        styleList.appendChild(li);
    });

    energyValue.textContent = `${energy * 10}%`;
    energyCopy.textContent = energy >= 8
        ? 'You are feeling highly energized and ready for a full, exciting day.'
        : energy >= 5
            ? 'Your energy is balanced — you are ready for a meaningful and steady day.'
            : 'You may want a slower, softer pace with room to recharge.';

    dreamDayOutput.textContent = `"${dreamDay}"`;
});
