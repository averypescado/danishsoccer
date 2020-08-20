import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Switch,
  useParams,
  Route,
  Link,
} from 'react-router-dom';

const Allteams = (teams) => {
  return (
    <div className='pa4'>
      <table class='f2 w-100 center' cellspacing='0'>
        <thead>
          <tr className='tl'>
            <th className='tl'>Team</th>
            <th>Points</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {teams.teams.map((team) => (
            <tr>
              <td className='bb b--black-20'>{team.team_name}</td>
              <td className='bb b--black-20'>{team.points}</td>
              <td className='bb b--black-20'>{team.recent_form}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul></ul>
    </div>
  );
  //<h1>{teams.teams[8].team_name}</h1>;
};

const Topscorers = (players) => {
  //console.log(players);
  const map1 = players.players.map((player) => {
    return player.stats.data;
  });
  //console.log(map1);

  const map2 = map1.map((player) => {
    const rightseason = player.filter((season) => season.season_id === 16020);
    return rightseason;
  });

  const map3 = map2.map((player) => {
    let sum = 0;
    player.forEach((season) => {
      sum += season.goals;
    });
    return sum;
  });

  return (
    <div>
      <ul className='list f2'>
        {players.players.map((player, index) => (
          <li key={player.player_id}>
            {' '}
            {map3[index]}{' '}
            <Link to={`/player/${player.player_id}`}>{player.fullname}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TopPlayer = ({players}) => {
  const id = useParams().player_id;
  const player = players.find((n) => n.player_id === Number(id));

  if (player != null) {
    const stats = player.stats.data;
    console.log(stats);
    const thisyear = stats.filter((season) => season.season_id === 16020);
    const cleanedupyear = thisyear[0];
    console.log(thisyear);
    return (
      <div className='bl bw1 pt4 pb4'>
        <div className='pl4 flex-l'>
          <img
            src={player.image_path}
            className='ba b--black db br-100 w4 h4'
            alt=''
          />
          <div className='pl3'>
            <h1>{player.display_name} </h1>
            <div className='flex-l'>
              <img
                src={player.country.data.image_path}
                className='db h2'
                alt=''
              />
              <p>{player.nationality}</p>
            </div>
            <div className='p pt2 f3'>
              Born in {player.birthplace}, on {player.birthdate},{' '}
              {player.display_name} stands at {player.height}, and weighs{' '}
              {player.weight}.<h2>Overall stats</h2>
              <div className='dt mt4 f3 '>
                <div className='dtc pa2 br bl'>
                  Goals: {cleanedupyear.goals} (hit post{' '}
                  {cleanedupyear.hit_post} times)
                </div>
                <div className='dtc pa2 br'>
                  Assists: {cleanedupyear.assists}
                </div>
                <div className='dtc pa2 br'>
                  Key passes: {cleanedupyear.passes.key_passes}
                </div>
              </div>
              <h2>Stats per 90 minutes</h2>
              <div className='dt mt4 f3 '>
                <div className='dtc pa2 br bl'>
                  Goals:{' '}
                  {Math.round(
                    (cleanedupyear.goals / cleanedupyear.minutes) * 90 * 100
                  ) / 100}
                </div>
                <div className='dtc pa2 br'>
                  Assists:
                  {Math.round(
                    (cleanedupyear.assists / cleanedupyear.minutes) * 90 * 100
                  ) / 100}
                </div>
                <div className='dtc pa2 br'>
                  Key passes:{' '}
                  {Math.round(
                    (cleanedupyear.passes.key_passes / cleanedupyear.minutes) *
                      90 *
                      100
                  ) / 100}
                </div>
              </div>
              <h2>Dribbling</h2>
              <div className='dt mt4 f3 '>
                <div className='dtc pa2 br bl'>
                  Attempts: {cleanedupyear.dribbles.attempts}
                </div>
                <div className='dtc pa2 br'>
                  Success ratio:{' '}
                  {Math.round(
                    (cleanedupyear.dribbles.success /
                      cleanedupyear.dribbles.attempts) *
                      100
                  ) / 100}
                </div>
                <div className='dtc pa2 br'>
                  Dribbled past: {cleanedupyear.dribbles.dribbled_past}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

const App = () => {
  const [logo, setLogo] = useState('');
  const [standings, setStandings] = useState([]);
  const [loadedTeams, setLoadedTeams] = useState(false);
  const [loadedScorers, setLoadedScorers] = useState(false);
  const [info, setInfo] = useState([]);
  useEffect(() => {
    let collector = [];

    //Get Logo
    axios
      .get(
        'https://soccer.sportmonks.com/api/v2.0/leagues?api_token=' +
          process.env.REACT_APP_API_KEY
      )
      .then((response) => {
        //console.log(response.data.data[0]);
        setLogo(response.data.data[0].logo_path);

        //Get the top scorers, include the player id
        axios
          .get(
            'https://soccer.sportmonks.com/api/v2.0/topscorers/season/16020/aggregated?api_token=' +
              process.env.REACT_APP_API_KEY +
              '&include=player'
          )
          .then((response) => {
            return response.data.data.aggregatedGoalscorers.data;
          })

          //Return the top 10
          .then((response) => {
            return response.slice(0, 10);
          })

          //for each item in top 10, make a player call getting their stats
          .then((response) => {
            response.map((player, index) => {
              axios
                .get(
                  'https://soccer.sportmonks.com/api/v2.0/players/' +
                    player.player_id +
                    '?api_token=' +
                    process.env.REACT_APP_API_KEY +
                    '&include=stats,country'
                )
                //Collector is a wierd middle ground
                .then((response) => {
                  collector = [...collector];
                  collector[index] = response.data.data;
                  return collector;
                })

                //put it into the info state
                .then((collector) => {
                  setInfo(collector.filter((player) => player));
                  setLoadedScorers(true);
                });
            });
          });

        axios
          .get(
            'https://soccer.sportmonks.com/api/v2.0/standings/season/16020?api_token=' +
              process.env.REACT_APP_API_KEY +
              '&include=season'
          )
          .then((response) => {
            setStandings(response.data.data[0].standings.data);
            setLoadedTeams(true);
          });
      });
  }, []);
  console.log(info);
  return (
    <div className='body helvetica'>
      <nav className='dt w-100 pa1 ph5-ns bb bw1'>
        <img src={logo} className='dib w2 fr-l' alt='' />
      </nav>
      <div className='flex-l justify-end'>
        <div className='w-50-l vh-100 main-image cover bg-center'></div>
        <div className='w-50-l vh-100 flex items-center'>
          <div className='f-headline ph4'>
            Lær mere om den danske fodboldliga
          </div>
        </div>
      </div>
      <div className='f-headline pt3 ph4 bt bw1 bb pb3'>
        League Table (2019-2020 season)
      </div>
      {loadedTeams && <Allteams teams={standings} />}
      <div className='f-headline pt3 ph4 bt bw1 bb v-mid pb3'>Top Scorers</div>
      <div className='flex-l justify-end bb bw1 mb4'>
        <div className='w-50-l'>
          {loadedScorers && <Topscorers players={info} />}
        </div>
        <div className='w-50-l'>
          <Route path='/player/:player_id'>
            <TopPlayer players={info} />
          </Route>
        </div>
      </div>
    </div>
  );
};
export default App;
