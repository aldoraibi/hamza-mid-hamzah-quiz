//
//  ContentView.swift
//  hamzahmotwasta
//
//  Created by mac on 07/10/2025.
//

import SwiftUI
import Combine

struct Question: Identifiable, Hashable {
    let id = UUID()
    let prompt: String          // الجملة/الكلمة للسؤال
    let choices: [String]       // الخيارات
    let correctIndex: Int       // فهرس الإجابة الصحيحة
    let note: String            // ملاحظة سريعة لسبب الكتابة
}

struct ContentView: View {
    // MARK: - حالة اللعبة
    @State private var started = false
    @State private var timeRemaining = 45 // مدة الجولة بالثواني
    @State private var score = 0
    @State private var questionIndex = 0
    @State private var showFeedback: Bool = false
    @State private var lastAnswerWasCorrect: Bool = false
    @State private var disabledChoices = false
    @State private var shuffledQuestions: [Question] = []

    // مؤقّت بسيط يعدّ تنازليًا
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            // خلفية خفيفة
            LinearGradient(stops: [
                .init(color: Color(.systemBackground), location: 0.0),
                .init(color: Color(.secondarySystemBackground), location: 1.0)
            ], startPoint: .topLeading, endPoint: .bottomTrailing)
            .ignoresSafeArea()

            VStack(spacing: 16) {
                header

                if !started {
                    startView
                } else if timeRemaining > 0 {
                    quizView
                } else {
                    resultView
                }
            }
            .padding()
        }
        // RTL
        .environment(\.layoutDirection, .rightToLeft)
        // مؤقّت الجولة
        .onReceive(timer) { _ in
            guard started else { return }
            if timeRemaining > 0 {
                timeRemaining -= 1
            }
        }
        // تجهيز الأسئلة عند أول ظهور
        .onAppear {
            resetGame()
        }
    }

    // MARK: - أجزاء الواجهة

    private var header: some View {
        VStack(spacing: 8) {
            Text("مسابقة الهمزة المتوسّطة")
                .font(.system(size: 28, weight: .bold))
            Text("سريعة وسهلة لطلاب الصف السادس")
                .font(.headline)
                .foregroundStyle(.secondary)
        }
    }

    private var startView: some View {
        VStack(spacing: 16) {
            Text("اضغط ابدأ لبدء جولة مدتها 45 ثانية.\nالإجابة الصحيحة تُكسبك نقطة.")
                .multilineTextAlignment(.center)
                .font(.title3)

            Button(action: {
                withAnimation { startGame() }
            }) {
                Text("ابدأ الجولة")
                    .font(.title2.weight(.semibold))
                    .padding(.vertical, 12)
                    .frame(maxWidth: .infinity)
                    .background(Color.accentColor.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier("startButton")
        }
    }

    private var quizView: some View {
        VStack(spacing: 16) {
            // شريط الوقت والنتيجة
            HStack {
                Label("\(timeRemaining) ث", systemImage: "timer")
                    .font(.headline)
                Spacer()
                Label("النقاط: \(score)", systemImage: "checkmark.seal")
                    .font(.headline)
            }

            // السؤال الحالي
            let q = currentQuestion()
            VStack(spacing: 8) {
                Text("اختر الإملاء الصحيح:")
                    .font(.title3)
                    .foregroundStyle(.secondary)

                Text(q.prompt)
                    .font(.system(size: 30, weight: .bold))
                    .padding(.vertical, 6)
            }

            // الخيارات
            VStack(spacing: 12) {
                ForEach(Array(q.choices.enumerated()), id: \.offset) { index, choice in
                    Button {
                        answerTapped(index)
                    } label: {
                        HStack {
                            Text(choice)
                                .font(.title2.weight(.semibold))
                            Spacer()
                        }
                        .padding(.vertical, 10)
                        .padding(.horizontal, 14)
                        .background(buttonBackground(for: index))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.secondary.opacity(0.25), lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .buttonStyle(.plain)
                    .disabled(disabledChoices)
                    .accessibilityIdentifier("choice_\(index)")
                }
            }

            // تغذية راجعة سريعة
            if showFeedback {
                Text(lastAnswerWasCorrect ? "أحسنت! ✅" : "إجابة غير صحيحة ❌")
                    .font(.headline)
                    .foregroundStyle(lastAnswerWasCorrect ? .green : .red)
                    .transition(.opacity)
                Text(q.note)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            Spacer(minLength: 0)

            // زر للسؤال التالي (يظهر بعد الإجابة)
            Button {
                nextQuestion()
            } label: {
                Text("التالي")
                    .font(.title3.weight(.semibold))
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity)
                    .background(Color.blue.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            .buttonStyle(.plain)
            .disabled(!showFeedback)
        }
    }

    private var resultView: some View {
        VStack(spacing: 16) {
            Text("انتهت الجولة!")
                .font(.largeTitle.weight(.bold))
            Text("نتيجتك: \(score) نقطة")
                .font(.title2)

            Button {
                withAnimation {
                    resetGame()
                    started = true
                }
            } label: {
                Text("إعادة الجولة")
                    .font(.title3.weight(.semibold))
                    .padding(.vertical, 10)
                    .frame(maxWidth: .infinity)
                    .background(Color.accentColor.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            Button {
                withAnimation {
                    resetGame()
                    started = false
                }
            } label: {
                Text("الرجوع للشاشة الرئيسية")
                    .font(.title3)
            }
            .buttonStyle(.borderless)
        }
    }

    // MARK: - منطق اللعبة

    private func startGame() {
        score = 0
        timeRemaining = 45
        questionIndex = 0
        showFeedback = false
        disabledChoices = false
        lastAnswerWasCorrect = false
        started = true
        shuffledQuestions.shuffle()
    }

    private func resetGame() {
        shuffledQuestions = Self.bank.shuffled()
        score = 0
        timeRemaining = 45
        questionIndex = 0
        showFeedback = false
        disabledChoices = false
        lastAnswerWasCorrect = false
    }

    private func currentQuestion() -> Question {
        guard questionIndex < shuffledQuestions.count else {
            // إذا خلصت الأسئلة نعيد خلطها
            shuffledQuestions.shuffle()
            questionIndex = 0
            return shuffledQuestions[0]
        }
        return shuffledQuestions[questionIndex]
    }

    private func answerTapped(_ index: Int) {
        guard !disabledChoices else { return }
        disabledChoices = true
        let q = currentQuestion()
        if index == q.correctIndex {
            score += 1
            lastAnswerWasCorrect = true
        } else {
            lastAnswerWasCorrect = false
        }
        withAnimation {
            showFeedback = true
        }
        // الانتقال التلقائي بعد 1.2 ثانية إلى السؤال التالي
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            nextQuestion()
        }
    }

    private func nextQuestion() {
        questionIndex += 1
        showFeedback = false
        disabledChoices = false
        lastAnswerWasCorrect = false
    }

    private func buttonBackground(for index: Int) -> some View {
        let q = currentQuestion()
        let isCorrect = index == q.correctIndex

        return Group {
            if showFeedback {
                if isCorrect {
                    Color.green.opacity(0.18)
                } else {
                    Color.red.opacity(0.10)
                }
            } else {
                Color(.tertiarySystemFill)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - بنك الأسئلة (الهمزة المتوسّطة)
extension ContentView {
    /// ملاحظة: أمثلة مختارة للمرحلة الابتدائية؛
    /// يمكن إضافة المزيد أو تعديل الملاحظات حسب كتاب الطالب.
    static let bank: [Question] = [
        Question(
            prompt: "يَـأْكُل / يَئْكل",
            choices: ["يَأْكُل", "يَئْكل"],
            correctIndex: 0,
            note: "حركة الهمزة السكون وما قبلها مفتوح ⇒ أقوى الحركة للفتحة ⇒ على الألف."
        ),
        Question(
            prompt: "سَأَل / سَئَل",
            choices: ["سَأَل", "سَئَل"],
            correctIndex: 0,
            note: "الفتحة أقوى من الكسرة ⇒ تكتب الهمزة على الألف."
        ),
        Question(
            prompt: "مُؤْمِن / مُئْمِن",
            choices: ["مُؤْمِن", "مُئْمِن"],
            correctIndex: 0,
            note: "الضمة على الهمزة ⇒ على الواو."
        ),
        Question(
            prompt: "مُؤَثِّر / مُأَثِّر",
            choices: ["مُؤَثِّر", "مُأَثِّر"],
            correctIndex: 0,
            note: "ضمّة على الميم وكسر/فتح يؤثران لكن الهمزة نفسها مضمومة أصلًا ⇒ على الواو."
        ),
        Question(
            prompt: "يُؤْثِر / يُئْثِر",
            choices: ["يُؤْثِر", "يُئْثِر"],
            correctIndex: 0,
            note: "الضمة تناسب الواو ⇒ على الواو."
        ),
        Question(
            prompt: "سَئِم / سَأِم",
            choices: ["سَئِم", "سَأِم"],
            correctIndex: 0,
            note: "قبل الهمزة مفتوح والهمزة مكسورة ⇒ الكسرة أقوى ⇒ على الياء (ئ)."
        ),
        Question(
            prompt: "رَأْس / رَئْس",
            choices: ["رَأْس", "رَئْس"],
            correctIndex: 0,
            note: "الفتحة أقوى من الكسرة هنا ⇒ على الألف."
        ),
        Question(prompt: "مَسْأَلة / مَسْئَلة", choices: ["مَسْأَلة", "مَسْئَلة"], correctIndex: 0, note: "قبل الهمزة ساكن والهمزة مفتوحة ⇒ على الألف."),
        Question(prompt: "فِئَة / فِيَة", choices: ["فِئَة", "فِيَة"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء (ئ)."),
        Question(prompt: "مَسْؤُول / مَسْئُول", choices: ["مَسْؤُول", "مَسْئُول"], correctIndex: 0, note: "الضمة تناسب الواو ⇒ على الواو."),
        Question(prompt: "مِئْذَنة / مِأْذَنة", choices: ["مِئْذَنة", "مِأْذَنة"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء (ئ)."),
        Question(prompt: "يَسْأَل / يَسْئَل", choices: ["يَسْأَل", "يَسْئَل"], correctIndex: 0, note: "الفتحة أقوى ⇒ على الألف."),
        Question(prompt: "بَائِس / بَأِس", choices: ["بَائِس", "بَأِس"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء (ئ)."),
        Question(prompt: "مُؤْتَمَر / مُئْتَمَر", choices: ["مُؤْتَمَر", "مُئْتَمَر"], correctIndex: 0, note: "الضمة تناسب الواو ⇒ على الواو."),
        Question(prompt: "يُؤْمن / يُئْمن", choices: ["يُؤْمن", "يُئْمن"], correctIndex: 0, note: "الضمة ⇒ على الواو."),
        Question(prompt: "مُتَفَائِل / مُتَفَأِل", choices: ["مُتَفَائِل", "مُتَفَأِل"], correctIndex: 0, note: "الكسرة أقوى ⇒ على الياء (ئ)."),
        Question(prompt: "مُؤْلِم / مُئْلِم", choices: ["مُؤْلِم", "مُئْلِم"], correctIndex: 0, note: "الهمزة متوسّطة على الواو لأن ما قبلها مضموم."),
        Question(prompt: "مُؤْذي / مُئْذي", choices: ["مُؤْذي", "مُئْذي"], correctIndex: 0, note: "الضمة تناسب الواو ⇒ على الواو."),
        Question(prompt: "تَفاؤُل / تَفائِل", choices: ["تَفاؤُل", "تَفائِل"], correctIndex: 0, note: "الضمة أقوى ⇒ على الواو."),
        Question(prompt: "سَائِل / سَأِل", choices: ["سَائِل", "سَأِل"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء."),
        Question(prompt: "مَرْئِيّ / مَرْأِيّ", choices: ["مَرْئِيّ", "مَرْأِيّ"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء (ئ)."),
        Question(prompt: "مُؤْمِنُون / مُئْمِنُون", choices: ["مُؤْمِنُون", "مُئْمِنُون"], correctIndex: 0, note: "الضمة ⇒ على الواو."),
        Question(prompt: "تَنْشِئَة / تَنْشِأَة", choices: ["تَنْشِئَة", "تَنْشِأَة"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء (ئ)."),
        Question(prompt: "يَتَفَأَّل / يَتَفَئَّل", choices: ["يَتَفَأَّل", "يَتَفَئَّل"], correctIndex: 0, note: "الفتحة ⇒ على الألف."),
        Question(prompt: "مَأْسَاة / مَئْسَاة", choices: ["مَأْسَاة", "مَئْسَاة"], correctIndex: 0, note: "الفتحة ⇒ على الألف."),
        Question(prompt: "سَائِح / سَأِح", choices: ["سَائِح", "سَأِح"], correctIndex: 0, note: "قبل الهمزة مكسور ⇒ على الياء (ئ)."),
        Question(prompt: "مُؤْتَمَن / مُئْتَمَن", choices: ["مُؤْتَمَن", "مُئْتَمَن"], correctIndex: 0, note: "الضمة ⇒ على الواو.")
    ]
}

#Preview {
    ContentView()
        .environment(\.layoutDirection, .rightToLeft)
}
