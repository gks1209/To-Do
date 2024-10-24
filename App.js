import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, //클릭했을 때의 투명도 (가장 많이 씀)
  TouchableHighlight, //클릭했을 때의 배경색
  TouchableWithoutFeedback, //그래픽이나 UI반응을 보여주진 않음
  Pressable, //TouchableWithoutFeedback과 비슷하지만 더 많은 설정을 줄 수 있음
  TextInput, //입력칸 (eyboardType:키보드 변경(숫자, 이메일), secureTextEntry:비밀번호, multiline:한 줄 이상 작성할 때 autoCapitalize:첫 단어 자동 대문자 등의 여러속성이 있음)
  ScrollView, //스크롤할 수 있게 함 => 많은 todo를 추가 할 수 있도록
  Alert, //사용자가 정말 toDo를 지우고 싶은지 확인
} from 'react-native';
import { Fontisto } from '@expo/vector-icons'; //아이콘 임포트
import AsyncStorage from '@react-native-async-storage/async-storage'; //expo install @react-native-async-storage/async-storage => AsyncStorage 설치
import { theme } from './colors';
import { useEffect, useState } from 'react';

const STORAGE_KEY="@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
  }, []);
  const travel = () => setWorking(false);
  const work = () => setWorking(true); 
  const onChangeText = (payload) => setText(payload); //payload자리에 어떤 변수 들어가도 상관 x //이부분 바꿈
  const saveToDos =  async (toSave) => { //현재 있는 toDos를 string으로 바꿔주고 await AsyncStorage.setItem을 해줄 것 toSave는 addToDo function을 통해서 saveToDos에 전해질 것
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY)
    if (s !== null) {
      setToDos(JSON.parse(s));
    } //parse : string을 javascript object로 만들어줌
  };
  //todo 추가
  const addToDo = async () => {
    if(text === ""){
      return
    }
    //todo 저장
    const newToDos = Object.assign( //수정없이 객체 결합
      {}, //비어있는 object (target object)
      toDos, //이전 todo
      {[Date.now()] : {text, working}, //새로운 todo
    });//3.5 Persist (4:27)
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  //todo 삭제
  const deleteToDo = async (key) => { 
    Alert.alert(
      "Delete To Do?", 
      "Are you sure?", [
      {text:"Cancel"},
      {text:"I'm Sure", 
        style: "destructive", // cancel 버튼 파랗게, I'm Sure 버튼 빨갛게
        onPress: () => {
          const newToDos = {...toDos} //state의 내용(...)으로 새로운 object 생성
          delete newToDos[key] //newToDos안에 있는 key(id_그냥 날짜) 삭제
          setToDos(newToDos); //state를 업데이트 
          saveToDos(newToDos); //local storage에 저장
        },
      },
    ]);
    return
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText,/**... : 스프레드 문법 (전체를 가져오기) */ color: working ? "white": theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableHighlight underlayColor="red" activeOpacity={0.5} onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white": theme.grey}}>Travel</Text>
        </TouchableHighlight>
      </View>
        <TextInput 
          onSubmitEditing={addToDo} //submit버튼 누르면 이벤트 발생
          onChangeText={onChangeText} //입력 테스트 변경 감지
          returnKeyType='done' // 키보드 return 키 done으로 변경
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"} 
          style={styles.input} 
        />
        <ScrollView>
          {Object.keys(toDos).map((key) => ( //toDo의 working이 현재 우리가 있는 모드인 working하고 같은지 확인
            toDos[key].working === working ?  <View style={styles.toDo} key={key}>
              <Text style={styles.toDoText}>{toDos[key].text}</Text>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Text>X</Text>
              </TouchableOpacity>
            </View> : null //만약 같다면 그걸 보여주고, 같지 않다면 보여주지 않음
        ))}
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { //앱의 최상위 뷰
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header:{ //Work, Travel
    justifyContent: "space-between",
    flexDirection: "row", //양옆으로 배열
    alignItems: "center", // 수평 정렬
    marginTop:100,
    marginBottom: 20, // 입력 칸과 버튼 사이에 여백 추가
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600", 
  },
  input: { //텍스트 입력필드
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: { //To-Do 항목
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
